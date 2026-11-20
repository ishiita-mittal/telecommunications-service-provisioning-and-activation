-- =====================================================
-- J21: Telecommunications Service Provisioning System
-- Database: telecommunications_db
-- MySQL Version: 8.0+
-- =====================================================

USE telecommunications_db;

-- 1. ROLES
CREATE TABLE roles (
    role_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(30) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- 2. USERS
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- 3. CUSTOMERS
CREATE TABLE customers (
    customer_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    address VARCHAR(255),
    city VARCHAR(80),
    state VARCHAR(80),
    postal_code VARCHAR(10),
    kyc_status ENUM('PENDING','VERIFIED','REJECTED')
        NOT NULL DEFAULT 'PENDING',
    CONSTRAINT fk_customers_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 4. SERVICE AGENTS
CREATE TABLE service_agents (
    agent_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    employee_code VARCHAR(30) NOT NULL UNIQUE,
    department VARCHAR(80),
    CONSTRAINT fk_agents_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 5. SERVICE PLANS
CREATE TABLE service_plans (
    plan_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    plan_name VARCHAR(100) NOT NULL,
    plan_type VARCHAR(50) NOT NULL,
    description TEXT,
    monthly_price DECIMAL(10,2) NOT NULL,
    data_limit_gb DECIMAL(10,2),
    validity_days INT NOT NULL DEFAULT 30,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_plan_price CHECK (monthly_price >= 0),
    CONSTRAINT chk_plan_validity CHECK (validity_days > 0)
);

-- 6. SERVICE ORDERS
CREATE TABLE service_orders (
    order_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT NOT NULL,
    plan_id BIGINT NOT NULL,
    reviewed_by BIGINT,
    order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    installation_address VARCHAR(255) NOT NULL,
    order_status ENUM(
        'SUBMITTED','UNDER_REVIEW','APPROVED',
        'REJECTED','PROVISIONING','ACTIVATION_PENDING',
        'ACTIVE','FAILED','CANCELLED'
    ) NOT NULL DEFAULT 'SUBMITTED',
    approval_remarks VARCHAR(500),
    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    CONSTRAINT fk_orders_plan
        FOREIGN KEY (plan_id) REFERENCES service_plans(plan_id),
    CONSTRAINT fk_orders_agent
        FOREIGN KEY (reviewed_by) REFERENCES service_agents(agent_id)
);

-- 7. ORDER STATUS HISTORY
CREATE TABLE order_status_history (
    history_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    changed_by BIGINT,
    old_status VARCHAR(40),
    new_status VARCHAR(40) NOT NULL,
    remarks VARCHAR(500),
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_order
        FOREIGN KEY (order_id) REFERENCES service_orders(order_id),
    CONSTRAINT fk_history_agent
        FOREIGN KEY (changed_by) REFERENCES service_agents(agent_id)
);

-- 8. NETWORK RESOURCES
CREATE TABLE network_resources (
    resource_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    resource_type VARCHAR(60) NOT NULL,
    resource_identifier VARCHAR(100) NOT NULL UNIQUE,
    resource_status ENUM('AVAILABLE','ALLOCATED','MAINTENANCE')
        NOT NULL DEFAULT 'AVAILABLE',
    location VARCHAR(100),
    description VARCHAR(255)
);

-- 9. PROVISIONING TASKS
CREATE TABLE provisioning_tasks (
    task_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    assigned_agent BIGINT,
    task_status ENUM(
        'PENDING','IN_PROGRESS','COMPLETED','FAILED'
    ) NOT NULL DEFAULT 'PENDING',
    started_at DATETIME,
    completed_at DATETIME,
    remarks VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tasks_order
        FOREIGN KEY (order_id) REFERENCES service_orders(order_id),
    CONSTRAINT fk_tasks_agent
        FOREIGN KEY (assigned_agent) REFERENCES service_agents(agent_id)
);

-- 10. RESOURCE ALLOCATIONS
CREATE TABLE resource_allocations (
    allocation_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    resource_id BIGINT NOT NULL,
    order_id BIGINT NOT NULL,
    allocated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    released_at TIMESTAMP NULL,
    CONSTRAINT fk_alloc_resource
        FOREIGN KEY (resource_id) REFERENCES network_resources(resource_id),
    CONSTRAINT fk_alloc_order
        FOREIGN KEY (order_id) REFERENCES service_orders(order_id),
    CONSTRAINT uq_resource_order UNIQUE (resource_id, order_id)
);

-- 11. ACTIVATION RECORDS
CREATE TABLE activation_records (
    activation_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL UNIQUE,
    activated_by BIGINT,
    activation_status ENUM(
        'PENDING','IN_PROGRESS','ACTIVE','FAILED'
    ) NOT NULL DEFAULT 'PENDING',
    activation_date DATETIME,
    remarks VARCHAR(500),
    CONSTRAINT fk_activation_order
        FOREIGN KEY (order_id) REFERENCES service_orders(order_id),
    CONSTRAINT fk_activation_agent
        FOREIGN KEY (activated_by) REFERENCES service_agents(agent_id)
);

-- 12. ACTIVATION TESTS
CREATE TABLE activation_tests (
    test_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    activation_id BIGINT NOT NULL,
    test_type VARCHAR(80) NOT NULL,
    test_result ENUM('PENDING','PASSED','FAILED')
        NOT NULL DEFAULT 'PENDING',
    tested_at DATETIME,
    remarks VARCHAR(500),
    CONSTRAINT fk_tests_activation
        FOREIGN KEY (activation_id) REFERENCES activation_records(activation_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_orders_customer ON service_orders(customer_id);
CREATE INDEX idx_orders_plan ON service_orders(plan_id);
CREATE INDEX idx_orders_status ON service_orders(order_status);
CREATE INDEX idx_orders_date ON service_orders(order_date);
CREATE INDEX idx_history_order ON order_status_history(order_id);
CREATE INDEX idx_tasks_order ON provisioning_tasks(order_id);
CREATE INDEX idx_tasks_status ON provisioning_tasks(task_status);
CREATE INDEX idx_alloc_order ON resource_allocations(order_id);
CREATE INDEX idx_activation_status ON activation_records(activation_status);
CREATE INDEX idx_tests_activation ON activation_tests(activation_id);
CREATE INDEX idx_plans_available ON service_plans(is_available);
