
-- =====================================================
-- J21: Telecommunications Service Provisioning System
-- Sample Data Script
-- Database: telecommunications_db
-- MySQL 8.0+
-- =====================================================

USE telecommunications_db;

-- Disable FK checks temporarily for clean seed execution
-- Only run this seed script on an empty database.

-- =====================================================
-- 1. ROLES
-- =====================================================

INSERT INTO roles (role_id, role_name, description) VALUES
(1, 'ADMIN', 'System administrator'),
(2, 'CUSTOMER', 'Telecommunications customer'),
(3, 'SERVICE_AGENT', 'Service order processing agent');

-- =====================================================
-- 2. USERS
-- Password values are placeholders, not real credentials.
-- =====================================================

INSERT INTO users
(user_id, role_id, full_name, email, password_hash, phone)
VALUES
(1, 1, 'System Administrator', 'admin@j21.com', 'PLACEHOLDER_HASH_ADMIN', '9876500001'),
(2, 2, 'Aarav Sharma', 'aarav@gmail.com', 'PLACEHOLDER_HASH_02', '9876500002'),
(3, 2, 'Ananya Verma', 'ananya@gmail.com', 'PLACEHOLDER_HASH_03', '9876500003'),
(4, 2, 'Rohan Gupta', 'rohan@gmail.com', 'PLACEHOLDER_HASH_04', '9876500004'),
(5, 2, 'Priya Singh', 'priya@gmail.com', 'PLACEHOLDER_HASH_05', '9876500005'),
(6, 2, 'Arjun Mehta', 'arjun@gmail.com', 'PLACEHOLDER_HASH_06', '9876500006'),
(7, 2, 'Sneha Patel', 'sneha@gmail.com', 'PLACEHOLDER_HASH_07', '9876500007'),
(8, 2, 'Kabir Malhotra', 'kabir@gmail.com', 'PLACEHOLDER_HASH_08', '9876500008'),
(9, 2, 'Isha Kapoor', 'isha@gmail.com', 'PLACEHOLDER_HASH_09', '9876500009'),
(10, 2, 'Vivaan Joshi', 'vivaan@gmail.com', 'PLACEHOLDER_HASH_10', '9876500010'),
(11, 2, 'Meera Nair', 'meera@gmail.com', 'PLACEHOLDER_HASH_11', '9876500011'),
(12, 3, 'Rahul Yadav', 'rahul.agent@j21.com', 'PLACEHOLDER_HASH_12', '9876510012'),
(13, 3, 'Neha Mishra', 'neha.agent@j21.com', 'PLACEHOLDER_HASH_13', '9876510013'),
(14, 3, 'Amit Kumar', 'amit.agent@j21.com', 'PLACEHOLDER_HASH_14', '9876510014'),
(15, 3, 'Pooja Reddy', 'pooja.agent@j21.com', 'PLACEHOLDER_HASH_15', '9876510015'),
(16, 3, 'Karan Shah', 'karan.agent@j21.com', 'PLACEHOLDER_HASH_16', '9876510016'),
(17, 3, 'Divya Rao', 'divya.agent@j21.com', 'PLACEHOLDER_HASH_17', '9876510017'),
(18, 3, 'Sahil Khan', 'sahil.agent@j21.com', 'PLACEHOLDER_HASH_18', '9876510018'),
(19, 3, 'Ritu Das', 'ritu.agent@j21.com', 'PLACEHOLDER_HASH_19', '9876510019'),
(20, 3, 'Manish Jain', 'manish.agent@j21.com', 'PLACEHOLDER_HASH_20', '9876510020'),
(21, 3, 'Simran Kaur', 'simran.agent@j21.com', 'PLACEHOLDER_HASH_21', '9876510021');

-- =====================================================
-- 3. CUSTOMERS
-- =====================================================

INSERT INTO customers
(user_id, address, city, state, postal_code, kyc_status)
VALUES
(2, 'Sector 62', 'Noida', 'Uttar Pradesh', '201309', 'VERIFIED'),
(3, 'Indirapuram', 'Ghaziabad', 'Uttar Pradesh', '201014', 'VERIFIED'),
(4, 'Sector 18', 'Noida', 'Uttar Pradesh', '201301', 'PENDING'),
(5, 'Vaishali', 'Ghaziabad', 'Uttar Pradesh', '201010', 'VERIFIED'),
(6, 'Raj Nagar Extension', 'Ghaziabad', 'Uttar Pradesh', '201017', 'VERIFIED'),
(7, 'Dwarka', 'New Delhi', 'Delhi', '110075', 'PENDING'),
(8, 'Gomti Nagar', 'Lucknow', 'Uttar Pradesh', '226010', 'VERIFIED'),
(9, 'Malviya Nagar', 'Jaipur', 'Rajasthan', '302017', 'VERIFIED'),
(10, 'Whitefield', 'Bengaluru', 'Karnataka', '560066', 'VERIFIED'),
(11, 'Andheri East', 'Mumbai', 'Maharashtra', '400069', 'REJECTED');

-- =====================================================
-- 4. SERVICE AGENTS
-- =====================================================

INSERT INTO service_agents
(user_id, employee_code, department)
VALUES
(12, 'J21-AG001', 'Order Management'),
(13, 'J21-AG002', 'Customer Support'),
(14, 'J21-AG003', 'Provisioning'),
(15, 'J21-AG004', 'Order Management'),
(16, 'J21-AG005', 'Technical Support'),
(17, 'J21-AG006', 'Provisioning'),
(18, 'J21-AG007', 'Customer Support'),
(19, 'J21-AG008', 'Activation'),
(20, 'J21-AG009', 'Technical Support'),
(21, 'J21-AG010', 'Activation');

-- =====================================================
-- 5. SERVICE PLANS
-- =====================================================

INSERT INTO service_plans
(plan_name, plan_type, description, monthly_price,
 data_limit_gb, validity_days, is_available)
VALUES
('Basic Broadband', 'BROADBAND', 'Basic home internet plan', 499.00, 100, 30, TRUE),
('Standard Fiber', 'FIBER', 'High speed fiber internet', 699.00, 200, 30, TRUE),
('Premium Fiber', 'FIBER', 'Premium high speed fiber', 999.00, 500, 30, TRUE),
('Unlimited Home', 'BROADBAND', 'Unlimited home broadband', 1199.00, NULL, 30, TRUE),
('Business Fiber', 'BUSINESS', 'Business connectivity plan', 2499.00, 1000, 30, TRUE),
('Mobile Basic', 'MOBILE', 'Basic mobile data service', 199.00, 20, 30, TRUE),
('Mobile Plus', 'MOBILE', 'Mobile data and calling plan', 399.00, 100, 30, TRUE),
('Mobile Premium', 'MOBILE', 'Premium mobile connectivity', 599.00, 200, 30, TRUE),
('Enterprise Connect', 'ENTERPRISE', 'Enterprise connectivity service', 4999.00, 2000, 30, TRUE),
('Legacy Broadband', 'BROADBAND', 'Older broadband plan', 399.00, 50, 30, FALSE);

-- =====================================================
-- 6. NETWORK RESOURCES
-- =====================================================

INSERT INTO network_resources
(resource_type, resource_identifier, resource_status, location, description)
VALUES
('ONT', 'ONT-NOI-001', 'AVAILABLE', 'Noida', 'Optical network terminal'),
('ONT', 'ONT-NOI-002', 'AVAILABLE', 'Noida', 'Optical network terminal'),
('ONT', 'ONT-GZB-001', 'AVAILABLE', 'Ghaziabad', 'Optical network terminal'),
('ONT', 'ONT-GZB-002', 'AVAILABLE', 'Ghaziabad', 'Optical network terminal'),
('ROUTER', 'RTR-NOI-001', 'AVAILABLE', 'Noida', 'Customer router'),
('ROUTER', 'RTR-NOI-002', 'AVAILABLE', 'Noida', 'Customer router'),
('ROUTER', 'RTR-GZB-001', 'AVAILABLE', 'Ghaziabad', 'Customer router'),
('ROUTER', 'RTR-GZB-002', 'AVAILABLE', 'Ghaziabad', 'Customer router'),
('IP_ADDRESS', 'IP-001', 'AVAILABLE', 'Delhi NCR', 'Static IP resource'),
('IP_ADDRESS', 'IP-002', 'AVAILABLE', 'Delhi NCR', 'Static IP resource'),
('OLT_PORT', 'OLT-NOI-01', 'AVAILABLE', 'Noida', 'Optical line terminal port'),
('OLT_PORT', 'OLT-GZB-01', 'AVAILABLE', 'Ghaziabad', 'Optical line terminal port'),
('SIM', 'SIM-001', 'AVAILABLE', 'Delhi', 'Mobile SIM resource'),
('SIM', 'SIM-002', 'AVAILABLE', 'Mumbai', 'Mobile SIM resource'),
('ROUTER', 'RTR-MUM-001', 'MAINTENANCE', 'Mumbai', 'Router under maintenance');

-- =====================================================
-- 7. SERVICE ORDERS
-- Generate 50 realistic transaction records.
-- =====================================================

INSERT INTO service_orders
(customer_id, plan_id, reviewed_by, order_date,
 installation_address, order_status, approval_remarks)
WITH RECURSIVE seq AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM seq WHERE n < 50
)
SELECT
    MOD(n - 1, 10) + 1,
    MOD(n - 1, 10) + 1,
    MOD(n - 1, 10) + 1,
    TIMESTAMPADD(DAY, -(n * 3), '2026-11-18 10:00:00'),
    CONCAT('House ', n, ', Sector ', MOD(n, 100) + 1),
    CASE
        WHEN MOD(n, 10) = 0 THEN 'REJECTED'
        WHEN MOD(n, 10) = 1 THEN 'SUBMITTED'
        WHEN MOD(n, 10) = 2 THEN 'UNDER_REVIEW'
        WHEN MOD(n, 10) = 3 THEN 'APPROVED'
        WHEN MOD(n, 10) = 4 THEN 'PROVISIONING'
        WHEN MOD(n, 10) = 5 THEN 'ACTIVATION_PENDING'
        WHEN MOD(n, 10) IN (6, 7) THEN 'ACTIVE'
        WHEN MOD(n, 10) = 8 THEN 'FAILED'
        ELSE 'CANCELLED'
    END,
    CONCAT('Sample order processing record ', n)
FROM seq;

-- =====================================================
-- 8. ORDER STATUS HISTORY
-- =====================================================

INSERT INTO order_status_history
(order_id, changed_by, old_status, new_status, remarks)
SELECT
    order_id,
    MOD(order_id - 1, 10) + 1,
    NULL,
    order_status,
    CONCAT('Initial status recorded for order ', order_id)
FROM service_orders;

-- =====================================================
-- 9. PROVISIONING TASKS
-- =====================================================

INSERT INTO provisioning_tasks
(order_id, assigned_agent, task_status, started_at,
 completed_at, remarks)
SELECT
    order_id,
    MOD(order_id - 1, 10) + 1,
    CASE
        WHEN MOD(order_id, 4) = 0 THEN 'FAILED'
        WHEN MOD(order_id, 4) = 1 THEN 'COMPLETED'
        WHEN MOD(order_id, 4) = 2 THEN 'IN_PROGRESS'
        ELSE 'PENDING'
    END,
    CASE WHEN MOD(order_id, 4) = 1
        THEN TIMESTAMPADD(DAY, -2, order_date)
        ELSE NULL END,
    CASE WHEN MOD(order_id, 4) = 1
        THEN TIMESTAMPADD(DAY, -1, order_date)
        ELSE NULL END,
    CONCAT('Provisioning task for order ', order_id)
FROM service_orders;

-- =====================================================
-- 10. RESOURCE ALLOCATIONS
-- =====================================================

INSERT INTO resource_allocations
(resource_id, order_id, allocated_at, released_at)
SELECT
    resource_id,
    resource_id,
    TIMESTAMPADD(DAY, -5, CURRENT_TIMESTAMP),
    NULL
FROM network_resources
WHERE resource_id <= 14;

-- =====================================================
-- 11. ACTIVATION RECORDS
-- =====================================================

INSERT INTO activation_records
(order_id, activated_by, activation_status, activation_date, remarks)
SELECT
    order_id,
    MOD(order_id - 1, 10) + 1,
    CASE
        WHEN MOD(order_id, 3) = 0 THEN 'FAILED'
        WHEN MOD(order_id, 3) = 1 THEN 'ACTIVE'
        ELSE 'IN_PROGRESS'
    END,
    CASE
        WHEN MOD(order_id, 3) = 1
        THEN TIMESTAMPADD(DAY, -1, order_date)
        ELSE NULL
    END,
    CONCAT('Activation record for order ', order_id)
FROM service_orders
WHERE order_id <= 25;

-- =====================================================
-- 12. ACTIVATION TESTS
-- Two tests for each activation record.
-- =====================================================

INSERT INTO activation_tests
(activation_id, test_type, test_result, tested_at, remarks)
SELECT
    activation_id,
    'CONNECTIVITY_TEST',
    CASE
        WHEN MOD(activation_id, 3) = 0 THEN 'FAILED'
        WHEN MOD(activation_id, 3) = 1 THEN 'PASSED'
        ELSE 'PENDING'
    END,
    CURRENT_TIMESTAMP,
    'Connectivity test result'
FROM activation_records;

INSERT INTO activation_tests
(activation_id, test_type, test_result, tested_at, remarks)
SELECT
    activation_id,
    'SIGNAL_STRENGTH_TEST',
    CASE
        WHEN MOD(activation_id, 4) = 0 THEN 'FAILED'
        WHEN MOD(activation_id, 4) = 1 THEN 'PASSED'
        ELSE 'PENDING'
    END,
    CURRENT_TIMESTAMP,
    'Signal strength test result'
FROM activation_records;


-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT 'roles' AS table_name, COUNT(*) AS total FROM roles
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'service_agents', COUNT(*) FROM service_agents
UNION ALL
SELECT 'service_plans', COUNT(*) FROM service_plans
UNION ALL
SELECT 'service_orders', COUNT(*) FROM service_orders
UNION ALL
SELECT 'order_status_history', COUNT(*) FROM order_status_history
UNION ALL
SELECT 'network_resources', COUNT(*) FROM network_resources
UNION ALL
SELECT 'provisioning_tasks', COUNT(*) FROM provisioning_tasks
UNION ALL
SELECT 'resource_allocations', COUNT(*) FROM resource_allocations
UNION ALL
SELECT 'activation_records', COUNT(*) FROM activation_records
UNION ALL
SELECT 'activation_tests', COUNT(*) FROM activation_tests;
