# Ze[flow] — Information Architecture

_HR · Attendance · Time-tracking platform for Zessta Software Solutions._
_Product family: **Ze[log]** (time & work) · **Ze[teams]** (people & attendance)._

This document maps the whole app: the navigation model, every screen and its
sub-structure, the role-based visibility rules, and the underlying data entities.
It is the reference for how the product is organized — for design, engineering, and
handoff.

---

## 1. The big picture

The app is a single-tenant workspace with a persistent left sidebar, a sticky topbar,
and a mobile bottom nav. Everything lives under one route group, `(dashboard)`.
Access is **role-scoped**: what you see in the nav, on a page, and inside a page
(tabs, actions) all depend on your role.

```
┌─────────────────────────────────────────────────────────────┐
│  TOPBAR   logo · Zessta   |   search · timer · role · 🔔 · avatar │
├──────────┬──────────────────────────────────────────────────┤
│ SIDEBAR  │                                                    │
│          │                                                    │
│  Home    │                   CONTENT                          │
│ ─Ze[log] │              (the active screen,                   │
│  Tracker │               wrapped in RouteGuard)               │
│  Projects│                                                    │
│  …       │                                                    │
│ ─Ze[teams]                                                    │
│  …       │                                                    │
│  Settings│                                                    │
│  Logout  │                                                    │
└──────────┴──────────────────────────────────────────────────┘
        (mobile: sidebar → bottom pill nav + "More" sheet)
```

**Shell regions** (`src/components/AppShell.tsx`, `src/app/(dashboard)/layout.tsx`):

| Region | Notes |
|---|---|
| **Sidebar** | Desktop-only, collapsible 264px ↔ 76px. Brand header, grouped nav, logout. Collapse state persisted (`zelog.sidebar.collapsed`). |
| **Topbar** | Sticky. Global search, mini timer, role switcher, notifications bell, avatar menu (Profile / Settings / Logout). |
| **Content** | Scroll container; wraps the active page in `<RouteGuard>` — a second line of defense beyond hiding nav items. |
| **Mobile nav** | Fixed bottom pill: Home · Tracker · Time Off · Directory + a "More" bottom-sheet for the rest. |

---

## 2. Roles & access model

Source of truth: `src/config/permissions.ts` and `src/config/nav.ts`.

Three roles, expressed through **11 permission primitives** (roles are just a bundle of
permissions). The active role is simulated for preview via `RoleSwitcher` and persisted
in `roleStore` (`zelog-role-v1`). Default preview role: **Super Admin**; preview user:
Irfan Alisha (`eng1`).

| Role | Permissions | In one line |
|---|---|---|
| **Super Admin** | all 11 | Full access to every module and setting. |
| **Admin** | all except `settings.manage` | Runs the workspace, teams, projects — but not platform settings. |
| **Employee** | `employees.view`, `attendance.view`, `timeoff.view`, `inbox.view` | Personal tracking + read-only people info. |

> There is no separate "New Hire" role in the access model — the string appears only as a
> legacy label/notification id.

**Two layers of enforcement:**
1. **Nav filtering** — `getNavGroupsForRole()` hides items the role can't use (empty groups drop their header).
2. **Route guard** — `RouteGuard` + `isHrefAllowedForRole()` renders `<Unauthorized />` if a restricted URL is typed directly. Detail/legacy routes not owned by a nav item are allowed by default.

---

## 3. Navigation map

Single source of truth: `NAV_GROUPS` in `src/config/nav.ts`. Four groups, in order.
Legend: 🟣 all roles · 🔵 staff only (super-admin + admin).

```
Home ......................... /              🟣

Ze[log]  (time & work)
├─ Tracker ................... /tracker       🟣
├─ Projects .................. /projects      🟣
├─ Clients ................... /clients       🔵  (clients.view)
├─ Reports ................... /reports       🔵  (reports.view)
└─ Dashboard ................. /dashboard     🔵  (reports.view)

Ze[teams]  (people & attendance)
├─ Attendance ................ /attendance    🟣  (attendance.view)
├─ Time Off .................. /time-off      🟣  (timeoff.view)
├─ Inbox ..................... /inbox         🟣  (inbox.view)
├─ Directory ................. /directory     🟣  (employees.view)
├─ Assets .................... /assets        🔵  (employees.view)
└─ Organization .............. /organization  🟣  (employees.view)

Settings ..................... /settings      🟣  (deep panels gated by settings.manage)
```

**What an Employee sees:** Home, Tracker, Projects, Attendance, Time Off, Inbox,
Directory, Organization, Settings — **not** Clients, Reports, Dashboard, or Assets.

**Detail / non-nav routes** (reachable via links, not the sidebar):
`/directory/new`, `/directory/[employeeId]`, `/directory/[employeeId]/edit`,
`/projects/[id]`, and the legacy `/team` (see §5.15).

---

## 4. Screen inventory (module → sub-structure → actions)

Each route is a thin `page.tsx` that renders a client component. Below, every screen
with its tabs/sections and primary actions.

### 4.1 Home — `/`
Role-aware landing dashboard. _`src/app/(dashboard)/page.tsx`, `src/components/home/*`_
- **Staff:** hero + 4 KPI tiles (Total Employees · Present · Remote · On Leave); "Needs your attention" (pending approvals); Working-From-Home & On-Leave-Today cards; attendance snapshot; celebrations + holidays. Super-admin also gets **Quick Add** (employee / holiday / client / project).
- **Employee:** hero with **web clock-in** instead of KPIs; team-scoped "on leave / remote"; celebrations; holidays.
- **Actions:** Apply Leave · Clock in · Quick Add (super-admin).

### 4.2 Dashboard — `/dashboard` 🔵
Time-tracking analytics. _self-contained page_
- **Views:** Team / Individual toggle · date range · project filter.
- **Sections:** 5 KPI cards (Tracked, Billable, Non-billable, Top Project, Top Client); Time-tracked bar chart (by Billability/Projects); Project-distribution donut; Top Projects table; Team Activity; Employee-month card (Individual).
- **Actions:** Export · filter by project.

### 4.3 Directory — `/directory`
Employee roster. _`src/components/directory/DirectoryHub.tsx`_
- **Tabs:** All Employees · Inactive (with counts).
- **Views:** Grid (cards) / List (Employee, ID, Job Title, Dept, Manager, Type, Status, Joined).
- **Filters:** Department · Team · Manager · Employment Type · Status.
- **Actions:** Add Employee (→ `/directory/new`) · Import · open profile · row kebab (View, Edit, Assign Project, Manage Leave, Assign Asset, Deactivate) · bulk bar (Change Dept/Manager, Assign Policy/Project, Export, Deactivate).

#### 4.3a Employee Profile — `/directory/[employeeId]`
Full record, 9 tabs. _`src/components/directory/EmployeeProfile.tsx`, `profile/*`_
1. **Overview** — summary, reporting, today's status, leave snapshot, projects, assets.
2. **About** — personal info, contact, emergency contact.
3. **Job** — job details, reporting (with inline edit).
4. **Attendance** — month heatmap, recent attendance.
5. **Leave** — balances, leave requests.
6. **Projects** — current, previous.
7. **Documents** — grouped Personal/Employment/Compliance (preview, download, replace, delete).
8. **Assets** — assigned, history, self-service requests.
9. **Activity** — audit trail.
- **Visibility:** admins/HR and self see all 9; an employee viewing _someone else_ sees only **About** + **Job**.
- **Actions:** Edit Employee · kebab (Assign Project, Manage Leave, Assign Asset, Deactivate).
- _(A `Time` tab component exists but is not wired into the current tab set.)_

#### 4.3b Add / Edit Employee — `/directory/new` · `/directory/[employeeId]/edit`
One shared form component; `employeeId` switches it to edit mode. _`AddEmployeePage.tsx`_
- **Tabs:** **Job** · **Personal** · **Employment & Education** · **Compensation**.
  - Job → sections: General Information · **Employment Details** (Joining Date, Job Title, Work Type) · **Organisational Details** (Department, Sub-dept, Reporting Manager, **Additional Reporting Manager**) · Employment Terms · Additional Work Info.
  - Personal → personal info · contact/addresses · dependents · emergency · social.
  - Employment & Education → summary · work experience (repeatable) · education (repeatable).
  - Compensation → CTC, currency, pay frequency, effective-from (sensitive).
- **Gate:** `employees.edit`. **Actions:** Create / Save Changes · Cancel · add/remove repeatable rows.

### 4.4 Organization — `/organization`
Interactive reporting tree. _`src/components/org/*`_
- **Sections:** hero · toolbar (count + department filter) · pan/zoom tree · employee drawer.
- **Role-scoped default view:** super-admin → head + reports; manager → their chain; employee → manager + self.
- **Actions (super-admin, via drawer):** Edit · Reassign manager (cycle-guarded) · Deactivate · Remove. _(Creation happens in Directory, not here.)_

### 4.5 Projects — `/projects`
Project list. _self-contained page_
- **Filters:** search · Client · Status · Access · Billing.
- **Table:** Project, Client, Tracked, Access, Billing, Status.
- **Actions:** New project (name, color, client, note, est. hours, public/billable) · row kebab (Edit, View entries, Manage access, Archive).

#### 4.5a Project Detail — `/projects/[id]`
Single-project workspace. _self-contained page_
- **KPIs:** Total Tracked · Sessions · Members · Billing.
- **Tabs:** **Members** (searchable table; change role, resend invite, remove; Invite Member) · **Settings** (name, client, color, visibility, billable defaults, rate, estimate; Save).

### 4.6 Clients — `/clients` 🔵
Client list with mapped-member counts. _self-contained page_
- **Table:** Name, Mapped Members, Active Mapped, Active/Inactive Contributors.
- **Actions:** Add client · Edit · View members · Delete.

### 4.7 Attendance — `/attendance`
Role-split attendance. _`src/components/attendance/AttendanceHub.tsx`_
- **Admin tabs:** Attendance Tracking (live log + quick-view) · Attendance Log Requests (approve/reject/send-back) · Attendance Analytics (trends, dept %, monthly %). Hero KPIs: Present, WFH, Client, Leave, Late.
- **Employee tabs:** Attendance Log · Calendar · Attendance Request. Hero with clock-in / apply-WFH.
- **Actions:** Clock in/out · Apply WFH · raise/decide requests · Export.

### 4.8 Tracker — `/tracker`
Personal timesheet. _`src/components/tracker/*`_
- **Sections:** timer hero (Live / Manual, task, project, billable, tags) · week → day groups with totals.
- **Actions:** Start/stop · manual add · edit/delete session · multi-select · filters.

### 4.9 Time Off — `/time-off`
Leave requests, balances, calendar, holidays. _`src/components/timeoff/*`_
- **Tabs:** My Time Off (balance rings, history) · My Team Time Off _(staff only)_ (approvals, bulk actions, team calendar) · Holidays (view-only; managed in Settings).
- **Actions:** Apply Leave · Add on behalf · Export CSV · approve/reject/request-changes/comment/cancel · bulk set status.

### 4.10 Assets — `/assets` 🔵
Equipment inventory + request queue. _`src/components/assets/AssetsHub.tsx`_
- **Tabs:** Assigned (search + Category/Status filters; inline condition/status edit) · Requests (approve/reject queue). Hero tiles: Total, Assigned, In Repair, Returned.
- **Actions:** Assign / Reassign asset · update condition/status · approve/reject · open owner profile.

### 4.11 Reports — `/reports` 🔵
Productivity / billable reporting. _self-contained page_
- **Tabs:** Summary (month card, daily-hours chart, group-by, top projects, distribution) · Detailed (entry table) · Weekly (project × weekday matrix).
- **Filters:** Team · Client · Projects · Status · Description + work-log quality strip.
- **Actions:** Date range · Export · Add entry · Smart Report.

### 4.12 Inbox — `/inbox`
Unified approvals + notifications. _`src/components/inbox/InboxHub.tsx`_
- **Tabs:** Take Action _(approvers only)_ — pending requests, group filter (All/Time Off/WFH/Attendance) · Notifications — personal activity + own request status.
- **Actions:** Approve / Reject / Send back (with comment); gated by `timeoff.approve` / `attendance.manage`.

### 4.13 Settings — `/settings`
Two-column settings workspace, searchable role-gated rail. _`src/components/settings/SettingsHub.tsx`_
- **Workspace** → Enterprise Setup _(super-admin)_
- **Workforce** → Employee Setup _(staff)_ · Attendance · Time Off · Holidays
- **Access** → Roles & Permissions _(super-admin)_ · Notifications
- **Personal** → My Profile · Appearance
- _(Several panels exist in code but aren't wired into the current nav — see §6.)_

### 4.14 Team — `/team` ⚠️ legacy
Time-tracking workspace member list (distinct from Directory). _self-contained page_
- Member table (Member, Email, Role, Billable rate) · invite · billable-rate management.
- **Not in the sidebar and not role-guarded** — reachable only by direct URL. Uses a divergent data model. Flagged for reconciliation or removal (see §6).

---

## 5. Data architecture

All data is front-end mock, persisted to `localStorage` via Zustand `persist`
(`skipHydration` + `useHydratedX()` hooks). **The `Employee` record is the identity
spine** — nearly every other entity references employees by `id`.

### 5.1 Entity relationship overview

```
                         ┌───────────────┐
                         │   Employee    │  (orgStore — the hub)
                         │  id, name,    │
                         │  managerId ───┼──┐ self-ref (reporting tree)
                         └───────┬───────┘  │ + additionalManagerId,
                                 │          │   hrManagerId, headId
             ┌───────────────────┼──────────┴──────────────┐
             │                   │                         │
      by department name   employeeId refs           location → calendar
             │                   │                         │
        ┌────▼─────┐   ┌─────────▼──────────┐        ┌──────▼────────┐
        │Department│   │ EmployeeProfileExtra│        │ HolidayCalendar│
        │+ teams   │   │ (employment, personal,       │ locations[]    │
        └──────────┘   │  comp, education, …)         └───────────────┘
                       ├─ Asset ─── AssetRequest (currentAssetId)
                       ├─ EmployeeDocument
                       ├─ ProjectAllocation ──→ project pool (embedded)
                       ├─ LeaveAdjustment ──→ LeaveType
                       ├─ ActivityEvent (audit)
                       ├─ TimeOffRequest ──→ LeaveType; approverIds[], comments[]
                       ├─ AttendanceRequest / CalendarDay / TeamMember
                       └─ AppNotification (actorId)
```

### 5.2 Core entities

| Entity | Key fields | Relationships | Where |
|---|---|---|---|
| **Employee** | id, name, email, jobTitle, department, location, status | `managerId` (tree), `additionalManagerId`, `hrManagerId`, `headId` (all → Employee); department by name | `orgData.ts` |
| **Department** | name, color, subDepartments[] (teams) | Employee links by name string | `orgData.ts` |
| **EmployeeProfileExtra** | employeeCode, team, employmentType, workMode, joiningDate, level, isManager, `additionalManagerId`, annualCtc (+ nested address/contacts/education/experience) | keyed by employee id | `directoryData.ts` |
| **Asset** | id, name, category, assetId, condition, status, history[] | `employeeId`, `assignedById` → Employee | `directoryData.ts` |
| **AssetRequest** | id, kind, category, status | `employeeId`, `decidedById`, `currentAssetId` → Asset | `directoryData.ts` |
| **EmployeeDocument** | id, group, category, expiry, status, private | `employeeId`, `uploadedById` | `directoryData.ts` |
| **ProjectAllocation** | id, role, allocationPct, billable, trackedHours, status | `employeeId`; `projectId` → embedded project pool | `directoryData.ts` |
| **ActivityEvent** | id, category, title, detail, at | `employeeId`, `byId` | `directoryData.ts` |
| **TimeOffRequest** | id, startDate/endDate, durationType, status, durationDays, comments[] | `employeeId`, `approverIds[]`, `notifyIds[]`; `leaveTypeId` → LeaveType | `timeOffData.ts` |
| **LeaveType** | id, name, color, allocation, tracksBalance | referenced by requests/adjustments | `timeOffData.ts` |
| **Holiday / HolidayCalendar** | date, name / country, locations[], holidays[] | calendar `locations[]` ↔ Employee.location | `timeOffData.ts` |
| **AttendanceRequest** | id, type, date, status, reason | `employeeId` | `attendanceData.ts` |
| **CalendarDay / TeamMember** | derived presence status per day/person | embeds/derives from Employee | `attendanceData.ts` |
| **TimeEntry / Project (tracker)** | id, task, durationSeconds, billable | `projectId` → tracker Project; **single-user, not tied to Employee** | `mockEntries.ts`, `types/tracker.ts` |
| **AppNotification** | id, kind, title, at, read, href | `actorId` → Employee | `notificationsData.ts` |
| **Enterprise** | id, name, domain, users, jobs | platform/tenant-level, separate graph | `enterprisesData.ts` |
| **CelebrationEmployee** | id, name, role, photo, years | ⚠️ own id space, **not** linked to Employee | `celebrationsData.ts` |

### 5.3 Stores

| Store | Persist key | Manages |
|---|---|---|
| `orgStore` | `zelog-org-v2` | employees, departments; CRUD, reassignManager (cycle-guarded), deactivate/remove |
| `directoryStore` | `zelog-directory-v1` (v3) | extras, assets, assetRequests, documents, allocations, leaveAdjustments, activity |
| `timeOffStore` | `zelog-timeoff-v2` | leave requests + lifecycle/comments |
| `timeOffSettingsStore` | `zelog-timeoff-settings-v1` | leave types, workweek, policy |
| `holidayStore` | `zelog-holidays-v3` | calendars, active calendar, CSV import; syncs global date math |
| `attendanceStore` | `zelog-attendance-v2` | live today state + attendance requests |
| `trackerStore` | `zelog-tracker-store-v4` | entries, projects, running timer, filters |
| `enterpriseStore` | `zelog-enterprise-v1` | company profile, regional, accent, entities, locations |
| `roleStore` | `zelog-role-v1` | active simulated role |
| `roleSettingsStore` | `zelog-role-settings-v3` | role defs + permissions |
| `employeeSetupStore` | `zelog-employee-setup-v1` | Add/Edit-form config (code format, option lists, onboarding, field visibility) |
| `celebrationStore` | `zelog-celebrations-v1` | posted celebrations + templates |
| `notificationsStore` | `zelog-notifications-v1` | read/unread ids only |

---

## 6. Known IA fragmentation & risks

Documented so the dev team can reconcile before/after handoff:

1. **`/team` is orphaned & unguarded** — not in the sidebar, no role gate, divergent
   data model from Directory. Reconcile with Directory or remove.
2. **Three "Project" notions** — tracker `Project` (real ids/colors), directory
   `PROJECT_POOL` (embedded, per-department), and Home free-text. They overlap by id but
   aren't a shared entity.
3. **Three "Client" notions** — attendance `CLIENTS`, tracker `Project.client` (string),
   directory project `client` (string). No unified Client entity behind the Clients page.
4. **Celebrations are decorative** — `CelebrationEmployee` uses its own id space and is
   not linked to real employees (unlike Home's people cards).
5. **Unwired Settings panels** — several panels exist in code but aren't in the Settings
   nav (AllEnterprises, AssetSettings, DepartmentManager, DirectorySettings, General,
   Integrations, Organization, Preferences, CelebrationTemplates).
6. **Unwired profile tab** — a `Time` tab component exists but isn't in the 9-tab set.
7. **Employee form surfaces** — Directory quick-add dialog vs. the full-page Add/Edit form
   should stay field-aligned to avoid data divergence.

---

## 7. Cross-cutting conventions

- **Shared tab bar:** `SubNav` (from `attendance/shared.tsx`) is reused by Time Off,
  Assets, Inbox, and Add Employee.
- **Role/permission gating:** `useCurrentUser` hook + `permissions.ts` + `RouteGuard`.
- **Everything role-scoped, three layers:** nav visibility → route guard → in-page
  tabs/actions.
- **Design language:** purple hero gradients, white surface cards, soft borders, MUI +
  Radix wrappers over shared tokens.

---

_Generated from source: `src/config/nav.ts`, `permissions.ts`, `AppShell.tsx`,
`src/app/(dashboard)/**`, `src/components/**`, `src/data/**`, `src/store/**`._
