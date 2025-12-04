# HomeNest Platform Workflows

Complete documentation of all user workflows for React Native app recreation.

## Table of Contents

1. [Authentication Flows](#1-authentication-flows)
2. [Onboarding Flow](#2-onboarding-flow)
3. [Project Management](#3-project-management)
4. [Stage/Phase Management](#4-stagephase-management)
5. [Todo/Task Workflows](#5-todotask-workflows)
6. [Expense Tracking](#6-expense-tracking)
7. [Document Management](#7-document-management)
8. [Supplier Management](#8-supplier-management)
9. [Team Management](#9-team-management)
10. [Project Sharing & External Collaborators](#10-project-sharing--external-collaborators)
11. [Contractor Portal](#11-contractor-portal)
12. [Settings & Profile](#12-settings--profile)

---

## 1. Authentication Flows

### 1.1 Sign Up (Email/Password)

**Components:** `SignupPage.tsx`, `AuthContext.tsx`

**User Journey:**
```
Landing Page → Sign Up Form
     ↓
Enter: First Name, Last Name, Email, Password, Confirm Password
     ↓
Password Validation (NIST-compliant):
  - Min 8 characters
  - Uppercase + lowercase
  - Contains number
     ↓
Submit → User Created in auth.users
     ↓
User Profile Created in user_profiles
     ↓
"Check Your Email" Success Screen
     ↓
User clicks email link → Email verified
     ↓
User can now log in
```

**API Calls:**
- `supabase.auth.signUp({ email, password })`
- Auto-creates `user_profiles` record via trigger

**Form Fields:**
| Field | Required | Validation |
|-------|----------|------------|
| First Name | Yes | Non-empty |
| Last Name | Yes | Non-empty |
| Email | Yes | Valid email format |
| Password | Yes | Min 8 chars, uppercase, lowercase, number |
| Confirm Password | Yes | Must match password |

---

### 1.2 Login

**Components:** `LoginPage.tsx`, `AuthContext.tsx`

**User Journey:**
```
Login Page → Enter Email & Password
     ↓
Check Rate Limits (max 5 attempts/15 min)
     ↓
supabase.auth.signInWithPassword()
     ↓
On Success:
  - Load user profile
  - Load tenant memberships
  - Navigate to Dashboard (or TenantSetup if no tenant)
     ↓
On Failure:
  - Show error message
  - Increment failed attempt counter
```

**Rate Limiting:**
- 5 failed attempts → 15-minute lockout
- Client-side + server-side enforcement
- Successful login resets counter

---

### 1.3 Session Management

**Initialization Flow:**
```typescript
1. App loads → supabase.auth.getSession()
2. Get current user from session
3. Load user_profiles record
4. Load tenant_memberships_with_tenant view
5. Restore selected tenant from localStorage
6. Set loading = false, app ready
```

**Real-time Auth Events:**
- `SIGNED_IN` → New login
- `SIGNED_OUT` → User logged out
- `TOKEN_REFRESHED` → Token refresh
- `USER_UPDATED` → Profile changed

---

### 1.4 Logout

**Actions:**
1. Clear React Query cache
2. Cancel all real-time subscriptions
3. Clear localStorage selections
4. `supabase.auth.signOut()`
5. Navigate to `/login`

---

### 1.5 Password Reset

**Flow (to implement in React Native):**
```
Login Page → "Forgot Password?" link
     ↓
Enter email → Submit
     ↓
Password reset email sent
     ↓
User clicks link → New password form
     ↓
Set new password → Redirect to login
```

---

## 2. Onboarding Flow

### 2.1 New User Detection

**Logic in `AuthWrapper.tsx`:**
```
User authenticated?
  ├─ No → Redirect to /login
  └─ Yes → Has tenant memberships?
       ├─ No → Show TenantSetup
       └─ Yes → Show main app
```

### 2.2 TenantSetup - Step 1: Organization

**Form Fields:**
| Field | Required | Notes |
|-------|----------|-------|
| Organization Name | Yes | e.g., "Acme Construction" |
| URL Slug | Yes | Auto-generated, editable |
| Description | No | Optional text |

**User Actions:**
1. Enter organization name
2. Slug auto-generates (e.g., "acme-construction")
3. Optionally edit slug and description
4. Click "Continue to Project Setup"

### 2.3 TenantSetup - Step 2: First Project

**Form Fields:**
| Field | Required | Default |
|-------|----------|---------|
| Project Name | Yes | - |
| Project Address | Yes | - |
| Start Date | Yes | Today |
| Target Completion | Yes | - |
| Total Budget | No | 0 |

**Database Operations on Submit:**
```sql
1. INSERT INTO tenants (name, slug, description, created_by)
2. INSERT INTO tenant_memberships (tenant_id, user_id, role='owner')
3. INSERT INTO projects (tenant_id, name, address, start_date, ...)
```

**Post-Completion:**
- If saved invitation URL exists → Redirect to accept invitation
- Otherwise → Navigate to dashboard

---

## 3. Project Management

### 3.1 Create Project

**Location:** Settings → Projects tab, or "New Project" button

**Form Fields:**
| Field | Required | Type |
|-------|----------|------|
| Name | Yes | Text |
| Description | No | Text |
| Address | No | Text |
| Start Date | No | Date |
| Target Completion | No | Date |
| Total Budget | No | Number |
| Status | No | Enum (default: planning) |

**API Call:**
```typescript
createProject({
  name: string,
  description: string,
  address: string,
  startDate: string,           // YYYY-MM-DD
  targetCompletionDate: string,
  totalBudget: number,
  status: 'planning'
})
```

### 3.2 Edit Project

**Editable Fields:**
- Name, description, address
- Start date, target completion date
- Total budget
- Status (planning, in-progress, completed, on-hold)

**Update Flow:**
1. User modifies field
2. Optimistic update to UI
3. API call to update
4. On error, revert UI

### 3.3 Project Selection

**Persistence:**
- Selected project ID stored in `localStorage`
- On app load, restore selection
- When tenant switches, clear selection (security)

**Navigation:**
- Project dropdown in sidebar/header
- Clicking project switches context
- All data views filter by selected project

### 3.4 Project Status Transitions

```
planning → in-progress → completed
    ↑           ↓
    └── on-hold ←┘
```

### 3.5 Delete Project

**Requirements:** Owner or admin role

**Cascade Deletes:**
- All stages
- All documents
- All suppliers
- All expenses
- All todos
- All project_members

---

## 4. Stage/Phase Management

### 4.1 Create Stage

**Form Fields:**
| Field | Required | Type |
|-------|----------|------|
| Name | Yes | Text |
| Description | No | Text |
| Category | No | Enum |
| Status | No | Enum (default: not-started) |
| Planned Start Date | No | Date |
| Planned End Date | No | Date |
| Estimated Cost | No | Number |
| Assigned Suppliers | No | Multi-select |
| Dependencies | No | Multi-select (other stages) |
| Notes | No | Text |

**Categories:**
- site-work
- utilities
- structure
- interior
- exterior
- finishing
- other

### 4.2 Stage Status Transitions

```
not-started → in-progress → completed
```

**When status changes to `in-progress`:**
- Can set actual_start_date

**When status changes to `completed`:**
- Can set actual_end_date

### 4.3 Assign Suppliers to Stages

**UI:** Multi-select dropdown of project suppliers

**Storage:** `assigned_suppliers UUID[]` in stages table

**Use Case:** Track which contractors work on which phases

### 4.4 Stage Dependencies

**Purpose:** Define stage sequences/ordering

**UI:** Multi-select of other project stages

**Storage:** `dependencies UUID[]` in stages table

**Display:** Timeline shows dependency arrows

### 4.5 Stage Views

| View | Description |
|------|-------------|
| Kanban | Columns: Not Started, In Progress, Completed. Drag-drop to change status |
| Timeline | Gantt chart showing planned vs actual dates |
| Roadmap | Milestone-focused view |
| List | Simple table view |

---

## 5. Todo/Task Workflows

### 5.1 Create Todo

**Form Fields:**
| Field | Required | Type |
|-------|----------|------|
| Title | Yes | Text |
| Description | No | Text |
| Priority | No | Enum (default: medium) |
| Status | No | Enum (default: todo) |
| Due Date | No | Date |
| Assigned To | No | User select |
| Link to Stages | No | Multi-select |
| Tags | No | Text array |

**Priorities:** low, medium, high, urgent

**Statuses:** todo, in-progress, completed, cancelled

### 5.2 Assign Todos

**User Selection:**
- Dropdown of team members in organization
- Shows avatar, name
- Can leave unassigned

**Related Data:**
```typescript
todo.assignedToUser = {
  id: string,
  first_name: string,
  last_name: string
}
```

### 5.3 Toggle Completion

**Quick Toggle (Checkbox):**
```
Click checkbox
  ↓
is_completed: true
status: 'completed'
completed_at: NOW()
  ↓
Visual: Strikethrough/grayed out
```

**Undo:**
```
Click checkbox again
  ↓
is_completed: false
status: 'todo'
completed_at: null
```

### 5.4 Link to Stages

**Storage:** `stage_ids UUID[]`

**Display:**
- Todo shows stage badges
- Stage detail shows related todos

### 5.5 Filtering & Sorting

**Filters:**
- Status
- Priority
- Assigned to
- Due date range
- Linked stage
- Tags

**Sorts:**
- Due date (asc/desc)
- Priority
- Created date
- Status

---

## 6. Expense Tracking

### 6.1 Add Expense

**Form Fields:**
| Field | Required | Type |
|-------|----------|------|
| Date | Yes | Date (default: today) |
| Amount | Yes | Number |
| Category | Yes | Text/Select |
| Description | No | Text |
| Stage | No | Select |
| Supplier | No | Select |
| Receipt | No | File upload |
| Status | No | Enum (default: pending) |
| Payment Method | No | Text |

**Categories (Common):**
- Materials
- Labor
- Permits
- Equipment
- Other

### 6.2 Link to Stage/Supplier

**Purpose:**
- Track costs per phase
- Track supplier payments

### 6.3 Upload Receipt

**Flow:**
```
Click "Upload Receipt"
  ↓
File picker opens
  ↓
Select image/PDF
  ↓
Upload to Supabase Storage
  ↓
Store path in receipt_url
```

**Validation:**
- Types: PDF, JPG, PNG, GIF
- Max size: 10MB

### 6.4 Expense Status

| Status | Description |
|--------|-------------|
| pending | Awaiting payment |
| paid | Payment completed |

### 6.5 Budget Tracking

**Calculations:**
```typescript
totalSpent = expenses.filter(e => e.status === 'paid')
                     .reduce((sum, e) => sum + e.amount, 0)

pendingAmount = expenses.filter(e => e.status === 'pending')
                        .reduce((sum, e) => sum + e.amount, 0)

available = totalBudget - totalSpent - pendingAmount
percentUsed = (totalSpent / totalBudget) * 100
```

**Display:**
- Project overview: Budget summary
- Expenses page: Full breakdown
- Per-stage: Stage costs

---

## 7. Document Management

### 7.1 Upload Document

**Flow:**
```
Click "Add Document"
  ↓
Select/drag file
  ↓
Fill metadata:
  - Name
  - Type
  - Category
  - Link to stages
  - Link to suppliers
  - Tags, notes
  ↓
Upload file to storage
  ↓
Create document record
```

### 7.2 Document Types

- permit
- contract
- invoice
- plan
- photo
- warranty
- financing
- other

### 7.3 File Validation

| Check | Requirement |
|-------|-------------|
| Type | PDF, JPG, PNG, GIF, WebP |
| Size | Max 10MB |
| Magic bytes | Server-side validation |

### 7.4 Link to Stages/Suppliers

**Storage:**
- `stage_ids UUID[]`
- `supplier_ids UUID[]`

### 7.5 View/Download

**View:**
1. Get signed URL (1-hour expiry)
2. Open in new tab/viewer

**Download:**
1. Get blob from storage
2. Trigger native download

---

## 8. Supplier Management

### 8.1 Add Supplier

**Form Fields:**
| Field | Required | Type |
|-------|----------|------|
| Name | Yes | Text |
| Company | No | Text |
| Phone | No | Text |
| Email | No | Email |
| Address | No | Text |
| Specialty | No | Text |
| Contract Value | No | Number |
| Payment Terms | No | Text |
| Rating | No | 1-5 stars |
| Is Active | No | Boolean (default: true) |
| Linked Stages | No | Multi-select |
| Notes | No | Text |

### 8.2 Link to Stages

**Storage:** `stage_ids UUID[]`

**Use Case:** Track which phases a supplier works on

### 8.3 Rating System

**Display:** 1-5 stars

**Usage:**
- Quality tracking
- Filter/sort by rating

---

## 9. Team Management

### 9.1 Tenant Roles

| Role | Permissions |
|------|-------------|
| owner | Full control, delete org |
| admin | Manage users, projects |
| manager | Manage projects, team |
| contractor | View/work on projects |
| viewer | Read-only access |

### 9.2 Invite Team Member

**Organization-Level Invite:**
```
Settings → Team → "Invite"
  ↓
Enter email
  ↓
Select role
  ↓
Send invitation
  ↓
Email sent with accept link
  ↓
Stored in invitations table (status: pending)
```

### 9.3 Manage Roles

**Actions:**
- Change member role (dropdown)
- Remove member (confirmation required)

### 9.4 Remove Member

**Organization Level:**
- Set `is_active = false` in tenant_memberships
- User loses access to all org projects
- Historical data preserved

---

## 10. Project Sharing & External Collaborators

### 10.1 Invite External Collaborator

**Flow:**
```
Project Settings → Team → "Invite Member"
  ↓
InviteToProjectModal:
  - Enter email
  - Select role
  - Select access method:
    * Full project access
    * Link to supplier (limited view)
    * Specific stages only
  ↓
Send Invitation
  ↓
Email with accept link sent
  ↓
Stored in project_members (status: pending)
```

### 10.2 Access Methods

| Method | Description |
|--------|-------------|
| Full Access | See all project data |
| Linked Supplier | Only stages where supplier assigned |
| Specific Stages | Only selected stages |

### 10.3 Invitation Acceptance

**Flow:**
```
User receives email
  ↓
Clicks "Accept Invitation"
  ↓
Redirected to /accept-invitation?token=...
  ↓
If not logged in:
  - Redirect to signup
  - After signup, return to accept
  ↓
If logged in:
  - Validate invitation
  - Update project_members:
    * user_id = current user
    * status = 'accepted'
    * accepted_at = NOW()
  ↓
Success screen → "Go to Project"
```

### 10.4 Stage-Based Access Control

**RLS Enforcement:**
```sql
-- User with allowed_stage_ids only sees those stages
-- User with linked_supplier_id only sees supplier's stages
-- Todos/expenses/documents filtered accordingly
```

### 10.5 Resend Invitation

**Action:** Click "Resend" on pending invitation

**Result:** Same token, new email sent

---

## 11. Contractor Portal

### 11.1 Portal Access

**Route:** `/portal/[projectId]`

**Guard Checks:**
1. User authenticated?
2. User is project member?
3. Membership status = 'accepted'?

### 11.2 Limited Access Rules

| Data | Access |
|------|--------|
| Stages | Only assigned stages |
| Todos | Only in accessible stages |
| Expenses | Only own expenses |
| Documents | Only in accessible stages |

### 11.3 Contractor Actions

**Can Do:**
- View assigned stages
- Toggle todo completion (assigned to them)
- Create expenses (auto-linked to their stage)
- Upload receipts
- View documents in their stages

**Cannot Do:**
- See other contractors' expenses
- Edit stage details
- See budget information
- Delete anything

### 11.4 Expense Submission

**Form (Simplified):**
- Date
- Amount
- Category (limited)
- Description
- Receipt upload

**Auto-Set:**
- Stage (from context)
- Supplier (if linked)
- Status = 'pending'

---

## 12. Settings & Profile

### 12.1 User Profile

**Editable Fields:**
| Field | Type |
|-------|------|
| First Name | Text |
| Last Name | Text |
| Phone | Text |
| Avatar | Image |
| Timezone | Select |

### 12.2 Organization Settings

**Fields:**
- Organization name
- Description
- Logo

### 12.3 Project Settings

**Fields:**
- Project name, address
- Budget, dates
- Status

**Actions:**
- Delete project (owner only)
- Manage team

### 12.4 Preferences

| Setting | Storage |
|---------|---------|
| Dark Mode | localStorage + Tailwind class |
| Language | localStorage + i18next |
| Selected Tenant | localStorage |
| Selected Project | localStorage |

---

## Real-Time Features

### Subscribed Tables

- projects
- stages
- todos
- expenses
- documents
- suppliers
- tenant_memberships
- project_members

### Subscription Pattern

```typescript
useEffect(() => {
  const unsubscribe = subscriptionManager.subscribe(
    'table_name',
    tenantId,
    () => queryClient.invalidateQueries(['key']),
    { debounceMs: 100 }
  )
  return unsubscribe
}, [tenantId])
```

---

## Database Schema Summary

```
tenants
├─ tenant_memberships (1:N)
├─ projects (1:N)
│   ├─ stages (1:N)
│   ├─ todos (1:N)
│   ├─ expenses (1:N)
│   ├─ documents (1:N)
│   ├─ suppliers (1:N)
│   └─ project_members (1:N)
└─ invitations (1:N)

user_profiles
├─ tenant_memberships (1:N)
└─ project_members (1:N)
```

---

## React Native Migration Notes

### Navigation
- Replace React Router with React Navigation
- Stack navigator for auth flow
- Tab navigator for main app
- Deep linking for invitations

### Storage
- Replace localStorage with AsyncStorage
- Consider secure storage for tokens

### File Handling
- Use device file picker
- Upload via Supabase Storage SDK

### Real-Time
- Supabase Realtime works in React Native
- Use same subscription pattern

### Styling
- Convert Tailwind to StyleSheet
- Or use NativeWind for Tailwind in RN

### Critical Flows to Test
1. Multi-tenant isolation (RLS)
2. Real-time sync
3. File uploads
4. Deep linking for invitations
5. Offline handling
