-- Seed data for local development and testing

-- Create test tenant
INSERT INTO tenants (id, name, slug) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Test Tenant', 'test-tenant')
ON CONFLICT DO NOTHING;

-- Create test user profile (user must be created via auth first)
-- This will be populated when a test user signs up

-- Note: To create a test user, run:
-- supabase auth signup --email test@example.com --password testpassword123
