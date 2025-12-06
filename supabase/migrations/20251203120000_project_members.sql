-- Migration: Project Members (External Collaborators)
-- Enables inviting external users to specific projects with stage-level access restrictions

-- ============================================================================
-- PART 0: CREATE PRIVATE SCHEMA FOR HELPER FUNCTIONS
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS private;

-- ============================================================================
-- PART 1: CREATE PROJECT_MEMBERS TABLE
-- ============================================================================

CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Role determines capabilities
    role user_role NOT NULL DEFAULT 'contractor',

    -- Access method (mutually exclusive)
    -- Option A: Explicit stage list
    allowed_stage_ids UUID[] DEFAULT NULL,
    -- Option B: Dynamic - follows supplier's stage assignments
    linked_supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,

    -- Invitation handling
    invitation_email TEXT,
    invitation_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    invitation_status TEXT DEFAULT 'pending'
        CHECK (invitation_status IN ('pending', 'accepted', 'declined', 'expired')),
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(project_id, user_id),
    UNIQUE(project_id, invitation_email),

    -- Ensure only one access method is set (not both)
    CONSTRAINT one_access_method CHECK (
        NOT (allowed_stage_ids IS NOT NULL AND linked_supplier_id IS NOT NULL)
    )
);

-- Indexes for common queries
CREATE INDEX idx_project_members_user ON project_members(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_token ON project_members(invitation_token)
    WHERE invitation_status = 'pending';
CREATE INDEX idx_project_members_supplier ON project_members(linked_supplier_id)
    WHERE linked_supplier_id IS NOT NULL;
CREATE INDEX idx_project_members_email ON project_members(invitation_email)
    WHERE invitation_email IS NOT NULL;

-- Enable RLS
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 2: HELPER FUNCTIONS (SECURITY DEFINER to avoid RLS recursion)
-- ============================================================================

-- Check if user has access to project (via tenant membership OR project membership)
CREATE OR REPLACE FUNCTION private.user_has_project_access(
    p_project_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
SET search_path = ''
SECURITY DEFINER
LANGUAGE sql
STABLE
AS $$
    SELECT EXISTS (
        -- Tenant member (owner of project)
        SELECT 1 FROM public.tenant_memberships tm
        JOIN public.projects p ON p.tenant_id = tm.tenant_id
        WHERE p.id = p_project_id
        AND tm.user_id = p_user_id
        AND tm.is_active = true
    )
    OR EXISTS (
        -- External project member (invited and accepted)
        SELECT 1 FROM public.project_members pm
        WHERE pm.project_id = p_project_id
        AND pm.user_id = p_user_id
        AND pm.invitation_status = 'accepted'
    );
$$;

-- Get accessible stage IDs for a user in a project
CREATE OR REPLACE FUNCTION private.get_accessible_stages(
    p_project_id UUID,
    p_user_id UUID
)
RETURNS UUID[]
SET search_path = ''
SECURITY DEFINER
LANGUAGE sql
STABLE
AS $$
    SELECT COALESCE(
        -- Priority 1: Supplier-derived stages (dynamic access)
        (
            SELECT s.stage_ids
            FROM public.project_members pm
            JOIN public.suppliers s ON s.id = pm.linked_supplier_id
            WHERE pm.project_id = p_project_id
            AND pm.user_id = p_user_id
            AND pm.invitation_status = 'accepted'
            AND pm.linked_supplier_id IS NOT NULL
            LIMIT 1
        ),
        -- Priority 2: Explicit stage list
        (
            SELECT pm.allowed_stage_ids
            FROM public.project_members pm
            WHERE pm.project_id = p_project_id
            AND pm.user_id = p_user_id
            AND pm.invitation_status = 'accepted'
            AND pm.allowed_stage_ids IS NOT NULL
            LIMIT 1
        ),
        -- Priority 3: All stages (tenant member or project member with no restrictions)
        (
            SELECT ARRAY_AGG(st.id)
            FROM public.stages st
            WHERE st.project_id = p_project_id
        )
    );
$$;

-- Check if user is a tenant member for a project (not external collaborator)
CREATE OR REPLACE FUNCTION private.is_tenant_member_for_project(
    p_project_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
SET search_path = ''
SECURITY DEFINER
LANGUAGE sql
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.tenant_memberships tm
        JOIN public.projects p ON p.tenant_id = tm.tenant_id
        WHERE p.id = p_project_id
        AND tm.user_id = p_user_id
        AND tm.is_active = true
    );
$$;

-- ============================================================================
-- PART 3: RLS POLICIES FOR PROJECT_MEMBERS TABLE
-- ============================================================================

-- Project members can be viewed by:
-- 1. Tenant members of the project's tenant
-- 2. The invited user themselves
CREATE POLICY "project_members_select" ON project_members
FOR SELECT TO authenticated
USING (
    -- Tenant member can see all project members
    (SELECT private.is_tenant_member_for_project(project_id, auth.uid()))
    OR
    -- User can see their own membership
    user_id = (SELECT auth.uid())
    OR
    -- User can see invitation addressed to their email
    invitation_email = (SELECT auth.email())
);

-- Only tenant members (manager+) can insert project members
CREATE POLICY "project_members_insert" ON project_members
FOR INSERT TO authenticated
WITH CHECK (
    (SELECT private.is_tenant_member_for_project(project_id, auth.uid()))
    AND EXISTS (
        SELECT 1 FROM tenant_memberships tm
        JOIN projects p ON p.tenant_id = tm.tenant_id
        WHERE p.id = project_id
        AND tm.user_id = (SELECT auth.uid())
        AND tm.role IN ('owner', 'admin', 'manager')
    )
);

-- Tenant members can update, or user can accept their own invitation
CREATE POLICY "project_members_update" ON project_members
FOR UPDATE TO authenticated
USING (
    -- Tenant member can update any project member
    (SELECT private.is_tenant_member_for_project(project_id, auth.uid()))
    OR
    -- User can update their own membership (to accept invitation)
    (invitation_email = (SELECT auth.email()) AND invitation_status = 'pending')
);

-- Only tenant members (admin+) can delete project members
CREATE POLICY "project_members_delete" ON project_members
FOR DELETE TO authenticated
USING (
    (SELECT private.is_tenant_member_for_project(project_id, auth.uid()))
    AND EXISTS (
        SELECT 1 FROM tenant_memberships tm
        JOIN projects p ON p.tenant_id = tm.tenant_id
        WHERE p.id = project_id
        AND tm.user_id = (SELECT auth.uid())
        AND tm.role IN ('owner', 'admin')
    )
);

-- ============================================================================
-- PART 4: UPDATE EXISTING RLS POLICIES TO INCLUDE PROJECT MEMBERS
-- ============================================================================

-- Update projects policy to include shared access
DROP POLICY IF EXISTS "projects_select_optimized" ON projects;
CREATE POLICY "projects_select_with_sharing" ON projects
FOR SELECT TO authenticated
USING (
    (SELECT private.user_has_project_access(id, auth.uid()))
);

-- Update stages policy to respect stage-level access for external members
DROP POLICY IF EXISTS "stages_select_optimized" ON stages;
CREATE POLICY "stages_select_with_sharing" ON stages
FOR SELECT TO authenticated
USING (
    -- Tenant members see all stages
    (SELECT private.is_tenant_member_for_project(project_id, auth.uid()))
    OR
    -- External members see only accessible stages
    (
        (SELECT private.user_has_project_access(project_id, auth.uid()))
        AND id = ANY(private.get_accessible_stages(project_id, auth.uid()))
    )
);

-- Update expenses policy to respect stage restrictions
DROP POLICY IF EXISTS "expenses_select_optimized" ON expenses;
CREATE POLICY "expenses_select_with_sharing" ON expenses
FOR SELECT TO authenticated
USING (
    -- Tenant members see all expenses
    (SELECT private.is_tenant_member_for_project(project_id, auth.uid()))
    OR
    -- External members see expenses in accessible stages only
    (
        stage_id = ANY(private.get_accessible_stages(project_id, auth.uid()))
    )
);

-- Allow external members to create expenses in accessible stages
DROP POLICY IF EXISTS "expenses_insert_optimized" ON expenses;
CREATE POLICY "expenses_insert_with_sharing" ON expenses
FOR INSERT TO authenticated
WITH CHECK (
    -- Tenant members with appropriate role
    (
        (SELECT private.is_tenant_member_for_project(project_id, auth.uid()))
        AND EXISTS (
            SELECT 1 FROM tenant_memberships tm
            JOIN projects p ON p.tenant_id = tm.tenant_id
            WHERE p.id = project_id
            AND tm.user_id = (SELECT auth.uid())
            AND tm.role IN ('owner', 'admin', 'manager', 'contractor')
        )
    )
    OR
    -- External members can create in accessible stages
    (
        stage_id = ANY(private.get_accessible_stages(project_id, auth.uid()))
        AND EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = expenses.project_id
            AND pm.user_id = (SELECT auth.uid())
            AND pm.invitation_status = 'accepted'
            AND pm.role IN ('contractor', 'manager', 'admin', 'owner')
        )
    )
);

-- Allow external members to update their own expenses
DROP POLICY IF EXISTS "expenses_update_optimized" ON expenses;
CREATE POLICY "expenses_update_with_sharing" ON expenses
FOR UPDATE TO authenticated
USING (
    -- Tenant members with appropriate role
    (
        (SELECT private.is_tenant_member_for_project(project_id, auth.uid()))
        AND EXISTS (
            SELECT 1 FROM tenant_memberships tm
            JOIN projects p ON p.tenant_id = tm.tenant_id
            WHERE p.id = project_id
            AND tm.user_id = (SELECT auth.uid())
            AND tm.role IN ('owner', 'admin', 'manager', 'contractor')
        )
    )
    OR
    -- External members can update their own expenses in accessible stages
    (
        created_by = (SELECT auth.uid())
        AND stage_id = ANY(private.get_accessible_stages(project_id, auth.uid()))
    )
);

-- Update documents policy for sharing
-- Note: documents has stage_ids (array), not stage_id
DROP POLICY IF EXISTS "documents_select_optimized" ON documents;
CREATE POLICY "documents_select_with_sharing" ON documents
FOR SELECT TO authenticated
USING (
    -- Tenant members see all documents
    (SELECT private.is_tenant_member_for_project(project_id, auth.uid()))
    OR
    -- External members see documents in accessible stages (or unassigned docs)
    (
        (SELECT private.user_has_project_access(project_id, auth.uid()))
        AND (
            stage_ids = '{}'
            OR stage_ids && private.get_accessible_stages(project_id, auth.uid())
        )
    )
);

-- Allow external members to upload documents
DROP POLICY IF EXISTS "documents_insert_optimized" ON documents;
CREATE POLICY "documents_insert_with_sharing" ON documents
FOR INSERT TO authenticated
WITH CHECK (
    -- Tenant members
    (SELECT private.is_tenant_member_for_project(project_id, auth.uid()))
    OR
    -- External members can upload to accessible stages
    (
        (
            stage_ids = '{}'
            OR stage_ids && private.get_accessible_stages(project_id, auth.uid())
        )
        AND EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = documents.project_id
            AND pm.user_id = (SELECT auth.uid())
            AND pm.invitation_status = 'accepted'
            AND pm.role IN ('contractor', 'manager', 'admin', 'owner')
        )
    )
);

-- Update todos policy for sharing
-- Note: todos has stage_ids (array), not stage_id
DROP POLICY IF EXISTS "todos_select_optimized" ON todos;
CREATE POLICY "todos_select_with_sharing" ON todos
FOR SELECT TO authenticated
USING (
    -- Tenant members see all todos
    (SELECT private.is_tenant_member_for_project(project_id, auth.uid()))
    OR
    -- External members see todos in accessible stages (or unassigned todos)
    (
        (SELECT private.user_has_project_access(project_id, auth.uid()))
        AND (
            stage_ids = '{}'
            OR stage_ids && private.get_accessible_stages(project_id, auth.uid())
        )
    )
);

-- ============================================================================
-- PART 5: TRIGGER FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER set_project_members_updated_at
    BEFORE UPDATE ON project_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- PART 6: VERIFICATION
-- ============================================================================

DO $$
BEGIN
    -- Verify table exists
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'project_members') THEN
        RAISE EXCEPTION 'project_members table not created';
    END IF;

    -- Verify RLS is enabled
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_members') THEN
        RAISE EXCEPTION 'RLS policies missing for project_members';
    END IF;

    -- Verify helper functions exist
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'user_has_project_access') THEN
        RAISE EXCEPTION 'user_has_project_access function not created';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_accessible_stages') THEN
        RAISE EXCEPTION 'get_accessible_stages function not created';
    END IF;

    RAISE NOTICE 'Migration verified successfully';
END $$;
