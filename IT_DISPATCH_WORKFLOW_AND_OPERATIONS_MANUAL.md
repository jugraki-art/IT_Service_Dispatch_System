# IT SERVICE DISPATCH & FAIR ODDS MANAGEMENT SYSTEM
## OPERATIONAL WORKFLOW & LIFECYCLE ARCHITECTURE MANUAL
**Document Code:** OWM-2026-V2  
**Project:** IT Service Dispatch System (`react-nest`)  
**Target Roles:** System Administrators, Dispatch Coordinators, IT Field Servicemen, End-Users  
**Classification:** Standard Operating Procedures (SOP) & Technical Workflow Guide  
**Date:** September 2026  

---

## 1. System Mission & Core Operating Philosophy

The **IT Service Dispatch System** guarantees:
1. **Equitable Dispatch Distribution:** Eliminates favoritism and technician burnout through an automated Fair Round-Robin Odds Engine.
2. **Mutual Verification & Accountability:** Technicians cannot close tickets unilaterally; only the service requester has the authority to terminate the session and release the technician back to available status.
3. **Supervisor Governance:** Exclusive authority is given to the IT Administrator to mark technicians absent or restore them back to active duty.
4. **Role-Isolated Security & Experience:** Every user operates in a dedicated, secure view tailored strictly to their authenticated account role. General users can register as Requesters or IT Servicemen, while administrative authority is strictly isolated to a single secure account.
5. **Transparent Odds Ranking:** When evaluating dispatches, candidates are ranked strictly descending by highest odds, with the technician selected earlier / longest idle awaiting their turn displayed first.

---

## 2. End-to-End Service Lifecycle Workflow

```
+----------------------------------------------------------------------------------------------------+
|                                      COMPLETE SERVICE LIFECYCLE FLOW                               |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|    [ 1. AUTHENTICATION & PORTAL ROUTING ]                                                          |
|    User logs in -> Routed to dedicated view (Requester / Admin / IT Serviceman Workspace)          |
|                                     |                                                              |
|                                     v                                                              |
|    [ 2. SERVICE INTAKE ]                                                                           |
|    Requester fills form or selects quick preset -> Submits ticket -> Status: `pending_admin`       |
|                                     |                                                              |
|                                     v                                                              |
|    [ 3. ODDS EVALUATION & DISPATCH ]                                                               |
|    Admin opens ticket -> Fair Odds Engine computes ranked scores for all UNOCCUPIED technicians    |
|    Admin selects top-odds candidate -> Clicks 'Push Notification & Assign'                         |
|    Ticket -> `assigned` | Technician -> `occupied` (dispatched)                                    |
|                                     |                                                              |
|                                     v                                                              |
|    [ 4. ON-SITE ACKNOWLEDGMENT ]                                                                   |
|    Technician receives push notification -> Arrives at user's room -> Clicks 'Start Service'       |
|    Ticket -> `in_progress` | Requester notified that technician is on-site                          |
|                                     |                                                              |
|                                     v                                                              |
|    [ 5. TECHNICAL RESOLUTION ]                                                                     |
|    Technician troubleshoots issue -> Logs diagnostic & resolution notes -> Clicks 'Mark Completed' |
|    Ticket -> `completed_by_it` | Technician enters HOLDING STATE (remains `occupied`)           |
|                                     |                                                              |
|                                     v                                                              |
|    [ 6. VERIFICATION & SESSION TERMINATION ]                                                       |
|    Requester receives golden action banner -> Inspects repair -> Clicks 'Terminate & Rate'         |
|    Requester selects 1-5 stars & enters feedback -> Clicks 'Confirm & Free Technician'             |
|    Ticket -> `session_terminated` (Closed)                                                         |
|                                     |                                                              |
|                                     v                                                              |
|    [ 7. TECHNICIAN RELEASE & COHORT UPDATE ]                                                       |
|    Technician status automatically reverts to `unoccupied`                                         |
|    Lifetime ratings & completed jobs recomputed                                                    |
|    Confetti celebration & success chime triggered                                                  |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Step-by-Step Actor Walkthroughs

### Step 1: User Signs In or Registers
* **Actor:** All Users
* **Location:** Authentication Gateway (`/`)
* **Procedures:**
  1. **Service Requester Registration:**
     - Click **Create Account**.
     - Select Role: **Service Requester**.
     - Provide full name, email, department, building, floor, room, and password.
     - Click **Register & Enter Portal**.
  2. **IT Serviceman Registration:**
     - Click **Create Account**.
     - Select Role: **IT Serviceman**.
     - Provide full name, email, phone, and password.
     - System automatically provisions a corresponding field technician record in MySQL (`it_technicians`) and links it to the user account.
  3. **System Administrator Access:**
     - Administrative self-registration is strictly blocked.
     - Use the exclusive master administrative account:
       - **Email:** `admin@dispatch.corp`
       - **Password:** `Admin@2026!`

---

### Step 2: Requester Submits a Service Request
* **Actor:** Service Requester (`user`)
* **Location:** Requester Portal
* **Actions:**
  1. Requester navigates to their dedicated **Requester Portal**.
  2. Requester selects a one-click preset (*Monitor Flickering*, *WiFi Dropping*, *Printer Jam*, *AV Echo*, *VPN Access Lock*) or enters custom symptoms and location.
  3. Requester specifies urgency level (`low`, `medium`, `high`, `critical`).
  4. Clicks **Submit Service Request**.
* **System Outcomes:**
  - Ticket created with status `pending_admin`.
  - Alert notification pushed to Admin Command Center.
  - Alert audio cue sounds.
  - Audit log records ticket intake.

---

### Step 3: Admin Evaluates Odds & Dispatches Technician
* **Actor:** Operations Administrator (`admin`)
* **Location:** Admin Command Center
* **Actions:**
  1. Admin inspects the **Pending Dispatch Queue**.
  2. Admin clicks **Evaluate & Dispatch IT Guy** on the target ticket.
  3. The **Fair Odds Evaluation Modal** opens, showing all currently unoccupied technicians.
  4. Candidates are strictly ordered descending by **Highest Odds**:
     - Candidate #1 (Highest Odds, Top Recommendation): Technicians who have not yet been assigned in the current round and have been idle the longest.
     - Lower Candidates: Technicians who have lower idle times or have already completed an assignment in the current round (decayed odds).
  5. Admin selects candidate and clicks **Push Notification & Assign**.
* **System Outcomes:**
  - Ticket transitions to `assigned`.
  - Selected technician status changes from `unoccupied` to `occupied`.
  - Push notification sent to the technician's console.
  - Status alert dispatched to the requester.
  - **Cohort Exhaustion Check:** If all non-absent technicians have now received assignments in the round, the system automatically closes Round $N$, creates Round $N+1$, and resets all round counters back to zero.

---

### Step 4: Technician Arrives On-Site & Starts Service
* **Actor:** Field IT Serviceman (`it_guy`)
* **Location:** IT Serviceman Workspace
* **Actions:**
  1. Technician receives real-time notification with requester details, room number, and symptom description.
  2. Technician travels to the requester's physical workstation.
  3. Technician clicks **Acknowledge & Start Service**.
* **System Outcomes:**
  - Ticket transitions from `assigned` to `in_progress`.
  - Requester's visual progress stepper updates to `On-Site`.
  - Requester receives notification: *"Technician has arrived on-site and started diagnostics."*

---

### Step 5: Technician Troubleshoots & Logs Resolution Notes
* **Actor:** Field IT Serviceman (`it_guy`)
* **Location:** IT Serviceman Workspace
* **Actions:**
  1. Technician diagnoses hardware/software defect and resolves the issue.
  2. In the Active Task Console, technician inputs mandatory **Technical Diagnostic & Resolution Notes**.
  3. Technician clicks **Mark Service as Completed**.
* **System Outcomes:**
  - Ticket transitions to `completed_by_it`.
  - **Technician Holding State:** The technician remains in **`occupied`** status and is not released yet.
  - A prominent golden callout banner appears on the requester's screen: *"Action Required: Service Finished. Please review notes and terminate session."*

---

### Step 6: Requester Verifies Repair & Terminates Session
* **Actor:** Service Requester (`user`)
* **Location:** Requester Portal
* **Actions:**
  1. Requester sees the golden banner and clicks **Terminate Session & Rate**.
  2. The **Session Termination Modal** opens, displaying the technician's logged repair notes.
  3. Requester selects a star rating (1 to 5 stars) and enters optional qualitative feedback.
  4. Requester clicks **Confirm & Free Technician**.
* **System Outcomes:**
  - Ticket transitions to `session_terminated` (Closed).
  - **Technician Release:** The technician's status is automatically reset to **`unoccupied`**, immediately re-entering them into the available dispatch pool.
  - The technician's lifetime rating is recalculated using weighted averaging:
    $$\text{New Rating} = \frac{(\text{Current Rating} \times \text{Total Reviews}) + \text{User Rating}}{\text{Total Reviews} + 1}$$
  - Completed jobs counter increments by 1.
  - Confetti particle explosion displays on the requester's screen.
  - Success audio chime sounds.

---

## 4. State Transition Reference Matrices

### 4.1 Service Request State Matrix

| Current State | Permitted Next State | Triggering Actor | Required Conditions |
|---|---|---|---|
| `[None]` | `pending_admin` | Requester (`user`) | Form validated (title, description, location) |
| `pending_admin` | `assigned` | Admin (`admin`) | Unoccupied technician selected via odds modal |
| `assigned` | `in_progress` | IT Serviceman (`it_guy`) | Technician acknowledges dispatch on-site |
| `in_progress` | `completed_by_it` | IT Serviceman (`it_guy`) | Resolution notes entered and submitted |
| `completed_by_it` | `session_terminated`| Requester (`user`) | Star rating submitted; technician freed |

---

### 4.2 IT Serviceman Attendance & Status Matrix

| Technician Status | Eligible for Dispatch? | Can Admin Mark Absent? | Can Admin Restore Unoccupied? | How Exited |
|---|:---:|:---:|:---:|---|
| **`unoccupied`** (Free) | **YES** | **YES** | N/A (Already unoccupied) | Dispatched to job (`occupied`) or marked absent by admin (`absent`). |
| **`occupied`** (On-Job) | **NO** | **BLOCKED** | **BLOCKED** | Requester formally terminates session and submits rating. |
| **`absent`** (Off-Duty) | **NO** | N/A (Already absent) | **YES** | Admin clicks 'Mark Back to Work' upon technician's return. |

> **Administrative Attendance Lockout Rule:**  
> The IT Administrator is the **sole authority** permitted to change a technician's status to `absent` or restore them to `unoccupied`. An `occupied` technician cannot be marked `absent` while actively attending an on-site user.

---

## 5. Mathematical Fair Odds Engine Formulation

Let $U = \{T_1, T_2, \dots, T_k\}$ be the set of all technicians where $\text{status}(T_i) = \text{'unoccupied'}$.

For each technician $T_i \in U$:
1. $m_i$: Idle duration in minutes since $T_i$'s `lastAssignedAt` (if null, $m_i = 9999$).
2. $a_i$: Boolean indicating whether $T_i$ has already been assigned in active round $R_n$.

The raw priority score $S(T_i)$ is computed as:
$$
S(T_i) = 
\begin{cases} 
1000 + \min(m_i \times 2, 500), & \text{if } a_i = \text{false (Fresh turn in Round } R_n\text{)} \\
50 + \min(m_i \times 0.2, 50), & \text{if } a_i = \text{true (Already assigned in Round } R_n\text{)}
\end{cases}
$$

The normalized selection odds percentage $P(T_i)$ is:
$$
P(T_i) = \left( \frac{S(T_i)}{\sum_{j=1}^k S(T_j)} \right) \times 100\%
$$

### Cohort Rollover Rule:
When $\text{count}(\text{assignedInRound}) \ge \text{count}(\text{nonAbsentTechnicians})$, the cohort is exhausted:
1. Active round $R_n$ is closed.
2. New round $R_{n+1}$ is initiated.
3. Every technician's round assignment counter is reset to $0$.
4. All unoccupied technicians regain high fresh-turn priority scores.

---

## 6. Multi-Role Testing & Verification Guidelines

To test end-to-end multi-role collaboration across isolated views:
1. **Option A: Multi-Browser Testing (Recommended):**
   - **Window 1 (Standard Chrome/Edge):** Log in as **Requester** (`sarah@dispatch.corp` / `user123`).
   - **Window 2 (Incognito / InPrivate Window):** Log in as **Administrator** (`admin@dispatch.corp` / `Admin@2026!`).
   - **Window 3 (Secondary Browser, e.g., Firefox):** Log in as **IT Serviceman** (`marcus@dispatch.corp` / `tech123`).
2. **Option B: Sequential Session Testing:**
   - Log in as Sarah -> Submit ticket -> Log out.
   - Log in as Admin -> Assign ticket to Marcus -> Log out.
   - Log in as Marcus -> Start job, complete job with notes -> Log out.
   - Log in as Sarah -> Golden banner prompts for review -> Rate and terminate session -> Marcus is freed!

---
*End of Operational Workflow & Lifecycle Architecture Manual.*
