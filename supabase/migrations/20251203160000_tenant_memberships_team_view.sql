-- Migration: Create tenant_memberships_team view for team members list
--
-- This view joins tenant_memberships with user_profiles to avoid PostgREST
-- embedded resource issues when fetching team member data.

-- ============================================================================
-- PART 1: CREATE VIEW
-- ============================================================================

CREATE OR REPLACE VIEW tenant_memberships_team AS
SELECT
  tm.id,
  tm.user_id,
  tm.tenant_id,
  tm.role,
  tm.is_active,
  tm.joined_at,
  up.first_name,
  up.last_name
FROM tenant_memberships tm
LEFT JOIN user_profiles up ON up.id = tm.user_id;

-- ============================================================================
-- PART 2: SECURITY CONFIGURATION
-- ============================================================================

-- Enable security_invoker so the view respects the underlying table's RLS policies
ALTER VIEW tenant_memberships_team SET (security_invoker = true);

-- Grant access to authenticated users
GRANT SELECT ON tenant_memberships_team TO authenticated;

-- ============================================================================
-- PART 3: VERIFICATION
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_views
    WHERE viewname = 'tenant_memberships_team'
  ) THEN
    RAISE EXCEPTION 'View tenant_memberships_team was not created';
  END IF;

  RAISE NOTICE 'Migration verified: tenant_memberships_team view created';
END $$;
