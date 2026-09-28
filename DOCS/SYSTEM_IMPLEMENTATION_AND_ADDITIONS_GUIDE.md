# IT SERVICE DISPATCH & FAIR ODDS MANAGEMENT SYSTEM
## SYSTEM IMPLEMENTATION & TECHNICAL ADDITIONS GUIDE
**Document Code:** SAG-2026-V2  
**Project:** IT Service Dispatch System (`react-nest`)  
**Stack:** React 19 (TypeScript) + NestJS v12 (TypeScript) + MySQL (XAMPP / TypeORM)  
**Classification:** Enterprise Engineering Architecture & Additions Specification  
**Date:** September 2026  

---

## 1. Executive Summary

The **IT Service Dispatch & Fair Odds Management System** is a full-stack enterprise operations solution developed to eliminate dispatch favoritism, balance technician workload, prevent premature ticket closure, and streamline IT service resolution loops.

The project is built on an enterprise-grade fullstack architecture:
- **Backend Tier:** **NestJS v12** with **TypeScript**, configured with **TypeORM** connecting to a local **MySQL** instance (`react_nest_db`) running on port `3306` via XAMPP.
- **Frontend Tier:** **React 19** with **TypeScript** and **Vite**, featuring strict role-based views (Requester Portal, Admin Command Center, IT Serviceman Workspace), Web Audio API sound synthesis, and interactive feedback mechanisms.
- **Role-Isolated Security Model:** Replaced multi-actor split views with authenticated, dedicated role portals. Users can only sign up as a **Requester (`user`)** or **Field Technician (`it_guy`)**. Administrative access is strictly quarantined to a single pre-configured administrative account with known credentials.
- **Relational Storage:** **MySQL Database (`react_nest_db`)** with schema synchronization, referential keys, and automated bootstrap data.

---

## 2. Core Architecture & Component Topology

```
+----------------------------------------------------------------------------------------------------+
|                                    APPLICATION ARCHITECTURE TOPOLOGY                               |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|    [ CLIENT APPLICATION LAYER (Vite + React 19 + TypeScript) ]                                     |
|    ├── Authentication Gateway (Sign In / Register with strictly limited roles)                     |
|    ├── Role-Isolated Portals:                                                                      |
|    │   ├── Requester Portal (Active ticket status, quick issue presets, golden termination prompt) |
|    │   ├── Admin Command Center (KPI counters, pending queue, fair odds modal, attendance control) |
|    │   └── IT Serviceman Workspace (Active job console, diagnostic notes, holding status banner)   |
|    ├── Sound Synthesizer (HTML5 AudioContext - Alert, Dispatch, and Completion Chimes)             |
|    └── Celebration Engine (Canvas Confetti triggered upon session termination)                     |
|                                              |                                                     |
|                                     HTTP / REST API via Axios                                      |
|                                              v                                                     |
|    [ BACKEND SERVICE LAYER (NestJS v12 + TypeScript) ]                                             |
|    ├── Authentication Module (Login, Register, Role Verification & Admin Lockout)                  |
|    ├── Dispatch Module: Odds Calculation Engine (O(N log N) with decay and cohort rollover)        |
|    ├── Requests Module: Complete ticket lifecycle from pending_admin to session_terminated         |
|    ├── Technicians Module: Roster management & exclusive Admin attendance control (absent/unoccupied)|
|    ├── Notifications Module: Targeted in-app push notifications & read receipts                    |
|    ├── Audit Logs Module: Immutable system activity audit trail                                    |
|    └── Seed Service: Automatic bootstrap population of admin, demo users, and technicians         |
|                                              |                                                     |
|                                        TypeORM Driver                                              |
|                                              v                                                     |
|    [ DATABASE LAYER (MySQL 8.0 / XAMPP) ]                                                          |
|    ├── users (Requesters, Admin, and IT personnel with hashed passwords & technicianId link)       |
|    ├── it_technicians (Field servicemen with live status, ratings, and round assignments)         |
|    ├── service_requests (Full ticket metadata, timestamps, notes, and user ratings)               |
|    ├── dispatch_rounds (Cohort round tracking and rollover management)                            |
|    ├── app_notifications (Multi-actor push alerts)                                                 |
|    └── audit_logs (Traceability log for dispatches and attendance overrides)                       |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Authentication & Role-Based Access Architecture

### 3.1 Security Policy & Registration Constraints
1. **Blocked Admin Self-Registration:**
   - Both frontend form validation and backend controller logic (`POST /api/auth/register`) strictly prohibit registering an account with `role: 'admin'`. Any attempt returns an HTTP `400 Bad Request`.
2. **Supported Registration Roles:**
   - **Service Requester (`user`):** Organization employees needing IT hardware, software, or network assistance.
   - **IT Serviceman (`it_guy`):** Field technicians who resolve on-site tickets.
3. **Single Master Administrator:**
   - There is exactly **one** designated system administrator account seeded directly into the MySQL database:
     - **Email:** `admin@dispatch.corp`
     - **Password:** `Admin@2026!`
     - **Role:** `admin`

### 3.2 Technician Entity Auto-Provisioning
When an account signs up with the `it_guy` role, the backend automatically:
1. Creates a corresponding record in `it_technicians` initialized to `status = 'unoccupied'`, with initial ratings count of 0 and 0 round assignments.
2. Links the newly created technician's `id` into `users.technicianId`.
3. When the technician logs in, their workspace automatically maps to their own operational profile and active tickets.

---

## 4. Detailed Breakdown of Backend Additions

All backend services reside under `backend/src/dispatch/` and are registered in `backend/src/app.module.ts`.

### 4.1 TypeORM Relational Entities

1. **`UserEntity` (`backend/src/dispatch/entities/user.entity.ts`):**
   - Table: `users`.
   - Fields: `id` (UUID), `name`, `email` (unique), `password` (VARCHAR(255)), `role` (`user`, `admin`, `it_guy`), `department`, `building`, `floor`, `room`, `phone`, `avatarUrl`, `technicianId` (nullable, links to `it_technicians`), `createdAt`.

2. **`TechnicianEntity` (`backend/src/dispatch/entities/technician.entity.ts`):**
   - Table: `it_technicians`.
   - Fields: `id`, `name`, `email` (unique), `phone`, `roleTitle`, `department`, `status` (`unoccupied`, `occupied`, `absent`), `currentRequestId`, `currentRoundAssignments`, `lifetimeAssignments`, `totalCompletedJobs`, `lastAssignedAt`, `rating` (DECIMAL(3,2)), `ratingsCount`, `isOnline`, `avatarUrl`, `createdAt`, `updatedAt`.

3. **`ServiceRequestEntity` (`backend/src/dispatch/entities/service-request.entity.ts`):**
   - Table: `service_requests`.
   - Fields: `id`, `ticketNumber` (e.g. `REQ-1051`), `requesterId`, `requesterName`, `requesterEmail`, `requesterDept`, `requesterPhone`, `locationBuilding`, `locationFloor`, `locationRoom`, `title`, `description`, `category`, `urgency`, `status` (`pending_admin`, `assigned`, `in_progress`, `completed_by_it`, `session_terminated`), `assignedTechnicianId`, `assignedTechnicianName`, `assignedTechnicianPhone`, `assignedAt`, `startedAt`, `completedAt`, `terminatedAt`, `resolutionNotes`, `userRating`, `userFeedback`, `createdAt`, `updatedAt`.

4. **`DispatchRoundEntity` (`backend/src/dispatch/entities/dispatch-round.entity.ts`):**
   - Table: `dispatch_rounds`.
   - Fields: `id`, `roundNumber` (INT unique), `isActive` (BOOLEAN), `totalEligibleTechnicians` (INT), `assignedTechnicianIdsJson` (TEXT), `startedAt`, `closedAt`.

5. **`AppNotificationEntity` (`backend/src/dispatch/entities/app-notification.entity.ts`):**
   - Table: `app_notifications`.
   - Fields: `id`, `recipientType` (`user`, `it_guy`, `admin`, `all`), `recipientId`, `title`, `message`, `type` (`dispatch`, `status_update`, `completion`, `termination`, `alert`), `requestId`, `ticketNumber`, `isRead`, `createdAt`.

6. **`AuditLogEntity` (`backend/src/dispatch/entities/audit-log.entity.ts`):**
   - Table: `audit_logs`.
   - Fields: `id`, `timestamp`, `actorName`, `actorRole`, `action`, `details`, `requestId`.

---

### 4.2 Core Backend Services & Business Logic

1. **Authentication Service (`backend/src/dispatch/auth.service.ts`):**
   - Manages user login, credential verification, and user registration.
   - Enforces admin registration lockout.
   - Automatically synchronizes field technicians with their user accounts.

2. **Fair Round-Robin Odds Engine (`backend/src/dispatch/dispatch.service.ts`):**
   - **Filter:** Evaluates only technicians with `status === 'unoccupied'`. Technicians marked `occupied` or `absent` are strictly excluded.
   - **Idle Duration Calculation:** Measures minutes elapsed since `lastAssignedAt`.
   - **Priority Score Formulation:**
     - *Fresh turn in round:* $S_i = 1000 + \min(\text{idleMinutes} \times 2, 500)$.
     - *Decayed turn in round:* $S_i = 50 + \min(\text{idleMinutes} \times 0.2, 50)$.
   - **Sorting & Odds Percentage:** Candidates are sorted descending by score ($S_1 \ge S_2 \ge \dots$). Odds percentage is computed as $P_i = \frac{S_i}{\sum S_k} \times 100\%$, guaranteeing the top candidate is the one with the highest odds.
   - **Atomic Assignment & Cohort Rollover:** Dispatches technician, marks them `occupied`, increments assignment count, and triggers cohort rollover to Round $N+1$ when all active technicians have completed their assignments.

3. **Service Request Lifecycle Service (`backend/src/dispatch/requests.service.ts`):**
   - `create`: Creates request in `pending_admin` status with auto-generated ticket numbers (e.g. `REQ-1051`).
   - `startService`: Transitions request to `in_progress` when technician arrives on-site.
   - `completeService`: Transitions request to `completed_by_it` and records resolution notes. **Crucial rule: Keeps technician in `occupied` holding state.**
   - `terminateSession`: Requester submits 1-5 star rating and feedback, transitioning ticket to `session_terminated`. **Releases technician back to `unoccupied` status** and recomputes the technician's lifetime average rating.

4. **Supervisor Attendance Management Service (`backend/src/dispatch/technicians.service.ts`):**
   - Enforces administrative privilege: Only administrators can modify technician attendance.
   - Allows toggling between `unoccupied` and `absent`.
   - **Strict Safety Guard:** Prevents marking an `occupied` technician as `absent` while actively servicing an on-site user.

5. **Bootstrap Seed Service (`backend/src/dispatch/seed.service.ts`):**
   - Auto-populates single admin account (`admin@dispatch.corp` / `Admin@2026!`), demo requester (`sarah@dispatch.corp` / `user123`), demo technician (`marcus@dispatch.corp` / `tech123`), technician roster, and active round.

---

### 4.3 RESTful API Endpoints

| Category | Method | Endpoint | Description | Role Access |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/auth/login` | Authenticate user & return session profile | Public |
| **Auth** | `POST` | `/api/auth/register` | Register new user (`user` or `it_guy` only) | Public |
| **Auth** | `GET` | `/api/auth/me` | Fetch authenticated user profile | Authenticated |
| **Odds Engine** | `GET` | `/api/dispatch/odds` | Computes live ranked odds for unoccupied technicians | Admin |
| **Dispatch** | `POST` | `/api/dispatch/assign` | Dispatches selected technician to a ticket | Admin |
| **Requests** | `POST` | `/api/requests` | Submits new service request (`pending_admin`) | Requester / Admin |
| **Requests** | `GET` | `/api/requests` | Lists requests with optional filters (`status`, `requesterId`, `technicianId`) | All Roles |
| **Requests** | `GET` | `/api/requests/:id` | Fetches details of a specific request | All Roles |
| **Execution** | `POST` | `/api/requests/:id/start` | Marks work as started (`in_progress`) | IT Serviceman |
| **Execution** | `POST` | `/api/requests/:id/complete` | Logs resolution notes (`completed_by_it`) | IT Serviceman |
| **Termination**| `POST` | `/api/requests/:id/terminate`| Requester rates & closes session (`session_terminated` -> `unoccupied`) | Requester |
| **Technicians** | `GET` | `/api/technicians` | Lists all technicians with live status and metrics | All Roles |
| **Attendance** | `PATCH`| `/api/technicians/:id/attendance` | Admin toggles attendance (`absent` vs `unoccupied`) | Admin Only |
| **Notifications**| `GET`| `/api/notifications` | Fetches notifications filtered by recipient | All Roles |
| **Notifications**| `PATCH`| `/api/notifications/:id/read` | Marks individual notification as read | All Roles |
| **Notifications**| `POST` | `/api/notifications/read-all` | Marks all notifications as read | All Roles |
| **Audit Logs** | `GET` | `/api/audit-logs` | Fetches recent audit trail entries | Admin |

---

## 5. Detailed Breakdown of Frontend Additions

### 5.1 Architecture & Navigation Model
- **No Split-View:** Removed the simulated multi-actor split view.
- **Dedicated Role View:** Upon logging in, the user sees only the specific interface for their role:
  - `role === 'user'` renders `<UserPortal />`
  - `role === 'admin'` renders `<AdminPortal />`
  - `role === 'it_guy'` renders `<ITGuyPortal />`
  - If unauthenticated, renders `<AuthPortal />`
- **Authenticated Header:** Shows current user name, role badge, department, notification bell, audio toggle, and a **Log Out** button.

### 5.2 Key Frontend Components

1. **`AuthPortal` (`src/components/AuthPortal.tsx`):**
   - Clean tabbed interface for Login and Registration.
   - Sign-up form strictly restricts role selection to **Service Requester** or **IT Serviceman**.
   - Prominent security callout explains that administrative access is restricted to master administrators.
   - Quick-fill demo buttons for easy evaluation of all three roles.

2. **`UserPortal` (`src/components/UserPortal.tsx`):**
   - **Golden Urgent Action Banner:** Appears when a technician completes work, instructing the user to verify the fix and terminate the session.
   - **One-Click Issue Presets:** Quick buttons (*Monitor Flickering*, *WiFi Dropping*, *Printer Jam*, *AV Echo*, *VPN Access Lock*) to populate tickets in seconds.
   - **5-Stage Visual Progress Stepper:** `Requested` -> `Dispatched` -> `On-Site` -> `Completed` -> `Closed`.
   - **Session Termination & Rating Modal:** 5-star rating selector, resolution notes inspection, and feedback form.

3. **`AdminPortal` (`src/components/AdminPortal.tsx`):**
   - **Operational KPI Cards:** Live statistics for available, occupied, and absent technicians, pending requests, and active round.
   - **Triage Queue & Odds Modal:** Live ranking of unoccupied technicians descending by highest odds, with explanatory odds formula breakdown.
   - **Attendance Governance:** Dedicated controls to mark technicians absent or back to work (locked for technicians currently servicing a user).
   - **Audit Trail:** Comprehensive activity history log.

4. **`ITGuyPortal` (`src/components/ITGuyPortal.tsx`):**
   - Automatically bound to the logged-in technician's identity.
   - Displays real-time status, customer rating, and lifetime completed jobs.
   - **Active Dispatch Console:** Displays on-site directions, ticket symptoms, start service action, diagnostic resolution notes entry, and holding state indicator.

---

## 6. Verification & Production Deployment

1. **Database Verification:**
   - MariaDB/MySQL is verified running on port `3306` with database `react_nest_db`.
   - Tables initialized: `users`, `it_technicians`, `service_requests`, `dispatch_rounds`, `app_notifications`, `audit_logs`.
2. **Backend & Frontend Verification:**
   - Production build compiles cleanly with zero errors.
   - Unified server serves the API at `/api` and hosts the frontend statically at `http://localhost:5000`.
   - Vite development server runs concurrently on `http://localhost:5173`.

---
*End of System Implementation & Technical Additions Guide.*
