-- Migration: Contractor Expense Privacy
--
-- Purpose: Ensure contractors can only see their OWN expenses, not other
-- contractors' expenses in the same stage. This maintains budget confidentiality
-- while allowing expense submission.
--
-- Current behavior (BEFORE):
--   - Tenant members: see all project expenses ✓
--   - External contractors: see ALL expenses in accessible stages ✗ (privacy issue)
--
-- New behavior (AFTER):
--   - Tenant members: see all project expenses ✓
--   - External contractors: see ONLY their own expenses ✓
--
-- Related tables: expenses, project_members, stages
-- Related functions: private.is_tenant_member_for_project, private.get_accessible_stages

-- ============================================================================
-- UPDATE EXPENSES SELECT POLICY
-- ============================================================================

DROP POLICY IF EXISTS "expenses_select_with_sharing" ON expenses;

CREATE POLICY "expenses_select_with_sharing" ON expenses
FOR SELECT TO authenticated
USING (
    -- Path 1: Tenant members can see all expenses for their projects
    (SELECT private.is_tenant_member_for_project(project_id, auth.uid()))
    OR
    -- Path 2: External contractors can only see their OWN expenses
    -- in stages they have access to via project_members
    (
        created_by = auth.uid()
        AND stage_id = ANY(private.get_accessible_stages(project_id, auth.uid()))
    )
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'expenses'
        AND policyname = 'expenses_select_with_sharing'
    ) THEN
        RAISE EXCEPTION 'expenses_select_with_sharing policy not created';
    END IF;

    RAISE NOTICE 'Contractor expense privacy migration applied successfully';
END $$;
