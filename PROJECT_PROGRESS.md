# Project Progress Report — J21 Telecommunications Service Provisioning & Activation System

**Date:** 2026-11-20  
**Project:** J21 – Telecommunications Service Provisioning and Activation System  
**Academic Year:** 2026–2027 | MCA  
**Workspace:** `D:\Projects\telecommunications-service-provisioning-and-activation`  

---

## 1. Executive Summary

This report documents the current implementation status of both frontend and backend for the J21 Telecommunications Service Provisioning and Activation System. The project has a solid foundation comprising 64 Java source files, a fully defined MySQL schema with seeded data, and a feature-rich React frontend interface. However, the frontend currently operates in a simulated demo mode relying on `localStorage` and mock data, while the backend has partial CRUD capabilities with an identified database constraint issue preventing `POST /api/plans` from persisting new records.

---

## 2. Technology Stack & Environment

| Component | Technology / Version | Port / URL | Status |
|-----------|----------------------|------------|--------|
| **Frontend** | React 18, Vite 6, Bootstrap 5, Axios 1.7.9, Lucide Icons, Recharts | `http://localhost:5173` | Running with mock/localStorage data |
| **Backend** | Java 17, Spring Boot 4.1.2, Spring Data JPA, Hibernate 7.4.13, Spring Security | `http://localhost:8081` | Running (64 source files compile cleanly) |
| **Database** | MySQL 8.0.46 (`telecommunications_db`) | `localhost:3306` | Active; schema & seeds loaded |

---

## 3. Database Schema & Seed Data Audit

The MySQL database `telecommunications_db` contains 12 normalized relational tables:
1. `roles` (3 records: `ADMIN`, `CUSTOMER`, `SERVICE_AGENT`)
2. `users` (21 records: 1 admin, 10 customers, 10 service agents)
3. `customers` (10 records linked 1-to-1 to users)
4. `service_agents` (10 records linked 1-to-1 to users with employee codes `J21-AG001` to `J21-AG010`)
5. `service_plans` (10 records: Broadband, Fiber, Mobile, Enterprise)
6. `service_orders` (Service order lifecycle tracking)
7. `order_status_history` (Audit log of order status transitions)
8. `network_resources` (SIM cards, fiber ports, broadband ports, network capacity)
9. `provisioning_tasks` (Automated & agent-assigned provisioning workflows)
10. `resource_allocations` (Network resource to order binding)
11. `activation_records` (Service activation states)
12. `activation_tests` (Simulated network testing records)

---

## 4. Backend Audit & Root Cause Analysis

### 4.1 Identified Root Cause: `POST /api/plans` 500 Error
- **Symptom:** `POST http://localhost:8081/api/plans` returned HTTP 500 Internal Server Error.
- **Exception Trace:** `java.sql.SQLIntegrityConstraintViolationException: Column 'created_at' cannot be null`.
- **Root Cause:** In `database/schema.sql`, the column is defined as:
  ```sql
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ```
  In `com.j21.telecom.entity.ServicePlan`:
  ```java
  @Column(name = "created_at")
  private LocalDateTime createdAt;
  ```
  When saving a new entity, `createdAt` is `null`. Hibernate generates an `INSERT` statement explicitly providing `NULL` for `created_at`. Under MySQL 8.0's `STRICT_TRANS_TABLES` mode, explicit `NULL` insertion into a `NOT NULL` column fails immediately instead of triggering the database default.
- **Other Affected Entities:**
  The same risk exists in:
  - `User.java` (`created_at`)
  - `ServiceOrder.java` (`order_date`)
  - `OrderStatusHistory.java` (`changed_at`)
  - `ProvisioningTask.java` (`created_at`)
  - `ResourceAllocation.java` (`allocated_at`)

### 4.2 Endpoint Implementation Coverage

| Module | Implemented Endpoints | Missing / Incomplete Operations |
|--------|-----------------------|----------------------------------|
| **Health** | `GET /api/health` | Complete |
| **Service Plans** | `GET /api/plans`, `GET /api/plans/available`, `GET /api/plans/{id}`, `GET /api/plans/type/{type}`, `POST /api/plans` (failing), `PUT /api/plans/{id}`, `DELETE /api/plans/{id}` | Fix `created_at` handling & DTO response mapping |
| **Customers** | `GET /api/customers`, `GET /api/customers/{id}`, `GET /api/customers/by-user/{userId}` | Missing `POST /api/customers`, `PUT /api/customers/{id}`, `DELETE /api/customers/{id}` |
| **Service Agents** | `GET /api/agents`, `GET /api/agents/{id}`, `GET /api/agents/by-user/{userId}`, `GET /api/agents/employee-code-exists`, `POST /api/agents`, `PUT /api/agents/{id}`, `DELETE /api/agents/{id}` | Needs user creation support / user linkage |
| **Users** | `GET /api/users/{id}`, `GET /api/users/by-email`, `GET /api/users/email-exists` | Missing `GET /api/users`, `POST /api/users` |
| **Roles** | `GET /api/roles`, `GET /api/roles/{id}` | Complete |
| **Orders** | Read-only (`GET /api/orders`, `GET /api/orders/{id}`, etc.) | Missing POST order, PUT status update |
| **History** | Read-only (`GET /api/order-history`) | Read-only by design |
| **Resources** | Read-only (`GET /api/resources`) | Missing status update / allocation |
| **Provisioning**| Read-only (`GET /api/provisioning/tasks`) | Missing task progress update (start/complete) |
| **Activation** | Read-only (`GET /api/activation/records`, tests) | Missing test execution / status update |

---

## 5. Frontend Audit

- **Routing & Navigation:** Controlled via `frontend/src/App.jsx` with routes for Dashboard, Customers, Service Agents, Service Plans, Service Orders, Order History, Network Resources, Provisioning, Activation, Settings.
- **State Management:** Currently reads/writes to `localStorage` through `frontend/src/data.js` (`telecomProDataV1`).
- **Axios Configuration:** Axios is installed as a dependency in `package.json` (`^1.7.9`), but no API client service has been written yet in `frontend/src/services/`.
- **UI Design System:** Custom theme with light/dark mode support, responsive sidebar, stat cards, Lucide icons, and modal dialog forms styled in `App.css`.

---

## 6. Action Plan for Next Phases

1. **Phase 2 — Fix Backend Issues:**
   - Add `@PrePersist` / default initialization for timestamp columns across entities (`ServicePlan`, `User`, `ServiceOrder`, `OrderStatusHistory`, `ProvisioningTask`, `ResourceAllocation`).
   - Implement `POST`, `PUT`, `DELETE` in `CustomerController` and `CustomerService`, including automatic creation of associated `User` with `ROLE_CUSTOMER`.
   - Add `GET /api/users` endpoint to allow selecting existing users when creating agents.
   - Implement global exception handling (`@RestControllerAdvice`) for structured validation and database error responses.
   - Test all endpoints with unit tests and curl/REST calls.
   - Rebuild backend jar and restart the backend service.

2. **Phase 3 — Connect Initial Three Modules (Plans, Customers, Agents):**
   - Create central Axios client (`frontend/src/services/api.js`).
   - Create API service modules (`planService.js`, `customerService.js`, `agentService.js`, `userService.js`).
   - Update `ServicePlans.jsx` / `App.jsx` to load and persist service plans from backend MySQL.
   - Update `Customers.jsx` / `App.jsx` to load and persist customers from backend MySQL.
   - Update `ServiceAgents.jsx` / `App.jsx` to load and persist service agents from backend MySQL.
   - Replace all localStorage bindings for these three modules with live API calls, loading indicators, and error banners.

3. **Phase 4 — End-to-End Verification:**
   - Test data flow: React Form -> Axios -> Spring Boot Controller -> Service -> JPA Repository -> MySQL Database -> React UI.
   - Verify changes persist across browser refreshes and reflect directly in MySQL database tables.

4. **Phase 5 — Remaining Modules & Workflows:**
   - Service Orders, Order Status History, Network Resources, Provisioning Tasks, Resource Allocations, and Activation Testing.
