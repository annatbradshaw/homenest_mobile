-- Migration: Create tenant_memberships_with_tenant view
--
-- This view simplifies the frontend query by pre-joining tenant_memberships with tenants.
-- It avoids PostgREST embedded resource issues and makes the query more reliable.

-- ============================================================================
-- PART 1: CREATE VIEW
-- ============================================================================

CREATE OR REPLACE VIEW tenant_memberships_with_tenant AS
SELECT
  tm.id,
  tm.user_id,
  tm.tenant_id,
  tm.role,
  tm.permissions,
  tm.is_active,
  tm.joined_at,
  tm.created_by,
  t.name as tenant_name,
  t.slug as tenant_slug,
  t.logo_url as tenant_logo_url
FROM tenant_memberships tm
JOIN tenants t ON t.id = tm.tenant_id;

-- ============================================================================
-- PART 2: SECURITY CONFIGURATION
-- ============================================================================

-- Enable security_invoker so the view respects the underlying table's RLS policies
ALTER VIEW tenant_memberships_with_tenant SET (security_invoker = true);

-- Grant access to authenticated users
GRANT SELECT ON tenant_memberships_with_tenant TO authenticated;

-- ============================================================================
-- PART 3: VERIFICATION
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_views
    WHERE viewname = 'tenant_memberships_with_tenant'
  ) THEN
    RAISE EXCEPTION 'View tenant_memberships_with_tenant was not created';
  END IF;

  RAISE NOTICE 'Migration verified: tenant_memberships_with_tenant view created';
END $$;
