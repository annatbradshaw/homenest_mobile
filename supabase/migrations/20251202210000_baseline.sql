-- HomeNest Database Baseline Migration
-- Squashed migration representing the complete current schema state
-- Generated from production database on 2025-12-02

BEGIN;

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE project_status AS ENUM ('planning', 'in-progress', 'completed', 'on-hold');
CREATE TYPE stage_status AS ENUM ('not-started', 'in-progress', 'completed');
CREATE TYPE stage_category AS ENUM ('site-work', 'utilities', 'structure', 'interior', 'exterior', 'finishing', 'other');
CREATE TYPE document_type AS ENUM ('permit', 'contract', 'invoice', 'plan', 'photo', 'warranty', 'other', 'financing');
CREATE TYPE expense_status AS ENUM ('pending', 'paid');
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'manager', 'contractor', 'viewer');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Tenants table (represents organizations/companies)
CREATE TABLE tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    timezone TEXT DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tenant memberships (many-to-many with roles)
CREATE TABLE tenant_memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'viewer',
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE(tenant_id, user_id)
);

-- Invitations table
CREATE TABLE invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'viewer',
    permissions JSONB DEFAULT '{}',
    status invitation_status DEFAULT 'pending',
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    start_date DATE NOT NULL,
    target_completion_date DATE NOT NULL,
    total_budget DECIMAL(12,2) NOT NULL DEFAULT 0,
    actual_spent DECIMAL(12,2) NOT NULL DEFAULT 0,
    status project_status NOT NULL DEFAULT 'planning',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    project_managers UUID[] DEFAULT '{}',
    contractors UUID[] DEFAULT '{}'
);

-- Stages table
CREATE TABLE stages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    status stage_status NOT NULL DEFAULT 'not-started',
    category stage_category NOT NULL DEFAULT 'other',
    planned_start_date DATE NOT NULL,
    planned_end_date DATE NOT NULL,
    actual_start_date DATE,
    actual_end_date DATE,
    estimated_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    actual_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    assigned_suppliers UUID[] DEFAULT '{}',
    dependencies UUID[] DEFAULT '{}',
    notes TEXT DEFAULT '',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Documents table
CREATE TABLE documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type document_type NOT NULL DEFAULT 'other',
    category TEXT NOT NULL,
    stage_ids UUID[] DEFAULT '{}',
    supplier_ids UUID[] DEFAULT '{}',
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    size TEXT NOT NULL,
    url TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    notes TEXT DEFAULT '',
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Suppliers table (with optional fields)
CREATE TABLE suppliers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    address TEXT DEFAULT '',
    specialty TEXT DEFAULT '',
    contract_value DECIMAL(12,2) NOT NULL DEFAULT 0,
    payment_terms TEXT DEFAULT '',
    rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
    notes TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    stage_ids UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Expenses table
CREATE TABLE expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    category TEXT NOT NULL,
    stage_id UUID REFERENCES stages(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    receipt_url TEXT,
    status expense_status NOT NULL DEFAULT 'pending',
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Todos table
CREATE TABLE todos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'completed', 'cancelled')),
    due_date DATE,
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    assigned_to UUID REFERENCES user_profiles(id),
    stage_ids UUID[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Tenants indexes
CREATE INDEX idx_tenants_created_by ON tenants(created_by);
CREATE INDEX idx_tenants_slug_active ON tenants(slug) WHERE slug IS NOT NULL;

-- Tenant memberships indexes
CREATE INDEX idx_tenant_memberships_active ON tenant_memberships(tenant_id, user_id) WHERE is_active = true;
CREATE INDEX idx_memberships_user_active ON tenant_memberships(user_id) WHERE is_active = true;
CREATE INDEX idx_tenant_memberships_created_by ON tenant_memberships(created_by);

-- Invitations indexes
CREATE INDEX idx_invitations_tenant_id ON invitations(tenant_id);
CREATE INDEX idx_invitations_status ON invitations(status);
CREATE INDEX idx_invitations_invited_by ON invitations(invited_by);
CREATE INDEX idx_invitations_email_pending ON invitations(email) WHERE status = 'pending';

-- Projects indexes
CREATE INDEX idx_projects_tenant_id ON projects(tenant_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_by ON projects(created_by);

-- Stages indexes
CREATE INDEX idx_stages_tenant_project ON stages(tenant_id, project_id);
CREATE INDEX idx_stages_status ON stages(status);
CREATE INDEX idx_stages_assigned_to ON stages(assigned_to);
CREATE INDEX idx_stages_created_by ON stages(created_by);
CREATE INDEX idx_stages_project_dates ON stages(project_id, planned_start_date, planned_end_date);

-- Documents indexes
CREATE INDEX idx_documents_tenant_project ON documents(tenant_id, project_id);
CREATE INDEX idx_documents_type_project ON documents(project_id, type);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);

-- Suppliers indexes
CREATE INDEX idx_suppliers_tenant_project ON suppliers(tenant_id, project_id);
CREATE INDEX idx_suppliers_project_id ON suppliers(project_id);
CREATE INDEX idx_suppliers_created_by ON suppliers(created_by);

-- Expenses indexes
CREATE INDEX idx_expenses_tenant_project ON expenses(tenant_id, project_id);
CREATE INDEX idx_expenses_project_date ON expenses(project_id, date);
CREATE INDEX idx_expenses_stage_id ON expenses(stage_id);
CREATE INDEX idx_expenses_supplier_id ON expenses(supplier_id);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_created_by ON expenses(created_by);

-- Todos indexes
CREATE INDEX idx_todos_tenant_id ON todos(tenant_id);
CREATE INDEX idx_todos_project_id ON todos(project_id);
CREATE INDEX idx_todos_assigned_to ON todos(assigned_to);
CREATE INDEX idx_todos_status ON todos(status);
CREATE INDEX idx_todos_due_date ON todos(due_date);
CREATE INDEX idx_todos_is_completed ON todos(is_completed);

-- User profiles indexes
CREATE INDEX idx_user_profiles_id ON user_profiles(id);

-- ============================================================================
-- FUNCTIONS (SECURITY DEFINER for RLS bypass)
-- ============================================================================

-- Helper function to check tenant access
CREATE OR REPLACE FUNCTION public.user_has_tenant_access(tenant_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_uuid UUID;
    has_access BOOLEAN := FALSE;
BEGIN
    user_uuid := (SELECT auth.uid());

    IF user_uuid IS NULL THEN
        RETURN FALSE;
    END IF;

    SELECT EXISTS(
        SELECT 1 FROM public.tenant_memberships
        WHERE tenant_id = tenant_uuid
        AND user_id = user_uuid
        AND is_active = TRUE
    ) INTO has_access;

    RETURN has_access;
END;
$$;

-- Helper function with role check
CREATE OR REPLACE FUNCTION public.user_has_tenant_access(tenant_uuid uuid, required_role user_role DEFAULT 'viewer'::user_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM tenant_memberships
        WHERE tenant_id = tenant_uuid
        AND user_id = auth.uid()
        AND is_active = true
        AND (
            role = 'owner' OR
            role = 'admin' OR
            (required_role = 'viewer' AND role IN ('manager', 'contractor', 'viewer')) OR
            (required_role = 'contractor' AND role IN ('manager', 'contractor')) OR
            (required_role = 'manager' AND role = 'manager') OR
            role = required_role
        )
    );
END;
$$;

-- Helper function to check modify permissions
CREATE OR REPLACE FUNCTION public.user_can_modify_tenant_resource(tenant_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_uuid UUID;
    user_role TEXT;
BEGIN
    user_uuid := auth.uid();

    IF user_uuid IS NULL THEN
        RETURN FALSE;
    END IF;

    SELECT role INTO user_role
    FROM public.tenant_memberships
    WHERE tenant_id = tenant_uuid
    AND user_id = user_uuid
    AND is_active = TRUE;

    RETURN user_role IN ('owner', 'admin', 'manager');
END;
$$;

-- Helper function for project deletion (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.user_can_delete_project(p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM tenant_memberships
    WHERE tenant_id = p_tenant_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND is_active = true
  );
$$;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, first_name, last_name, timezone, preferences)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        'UTC',
        '{}'::jsonb
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Function to update project actual_spent
CREATE OR REPLACE FUNCTION public.update_project_actual_spent()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    project_uuid UUID;
    total_spent NUMERIC;
BEGIN
    IF TG_OP = 'DELETE' THEN
        project_uuid := OLD.project_id;
    ELSE
        project_uuid := NEW.project_id;
    END IF;

    SELECT COALESCE(SUM(amount), 0) INTO total_spent
    FROM public.expenses
    WHERE project_id = project_uuid;

    UPDATE public.projects
    SET actual_spent = total_spent, updated_at = now()
    WHERE id = project_uuid;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- Function to set completed_at on todos
CREATE OR REPLACE FUNCTION public.set_completed_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.is_completed = true AND OLD.is_completed = false THEN
        NEW.completed_at = NOW();
    ELSIF NEW.is_completed = false AND OLD.is_completed = true THEN
        NEW.completed_at = NULL;
    END IF;
    RETURN NEW;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.user_has_tenant_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_tenant_access(uuid, user_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_can_modify_tenant_resource(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_can_delete_project(uuid) TO authenticated;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- New user trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Timestamp update triggers
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stages_updated_at
    BEFORE UPDATE ON stages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Todo completion trigger
CREATE TRIGGER set_todos_completed_at
    BEFORE UPDATE ON todos
    FOR EACH ROW EXECUTE FUNCTION set_completed_at();

-- Expense triggers for project actual_spent
CREATE TRIGGER update_project_spent_on_expense_insert
    AFTER INSERT ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_project_actual_spent();

CREATE TRIGGER update_project_spent_on_expense_update
    AFTER UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_project_actual_spent();

CREATE TRIGGER update_project_spent_on_expense_delete
    AFTER DELETE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_project_actual_spent();

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES (Optimized versions)
-- ============================================================================

-- Tenants policies
CREATE POLICY "tenants_authenticated_insert" ON tenants
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "tenants_creator_access" ON tenants
    FOR ALL USING (created_by = auth.uid());

CREATE POLICY "tenants_simple_select" ON tenants
    FOR SELECT USING (created_by = auth.uid() OR auth.uid() IS NOT NULL);

-- User profiles policies
CREATE POLICY "user_profiles_select_optimized" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "user_profiles_insert_optimized" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_update_optimized" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Tenant memberships policies
CREATE POLICY "tenant_memberships_own_select" ON tenant_memberships
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "tenant_memberships_own_update" ON tenant_memberships
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "tenant_memberships_creator_manage" ON tenant_memberships
    FOR ALL USING (
        user_id = auth.uid() OR
        tenant_id IN (SELECT id FROM tenants WHERE created_by = auth.uid())
    );

CREATE POLICY "tenant_memberships_insert_allowed" ON tenant_memberships
    FOR INSERT WITH CHECK (
        user_id = auth.uid() OR
        tenant_id IN (SELECT id FROM tenants WHERE created_by = auth.uid())
    );

-- Invitations policies
CREATE POLICY "invitations_select_optimized" ON invitations
    FOR SELECT USING (
        email = auth.email() OR
        EXISTS (
            SELECT 1 FROM tenant_memberships
            WHERE tenant_memberships.tenant_id = invitations.tenant_id
            AND tenant_memberships.user_id = auth.uid()
            AND tenant_memberships.role IN ('owner', 'admin')
            AND tenant_memberships.is_active = true
        )
    );

CREATE POLICY "invitations_insert_optimized" ON invitations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM tenant_memberships
            WHERE tenant_memberships.tenant_id = invitations.tenant_id
            AND tenant_memberships.user_id = auth.uid()
            AND tenant_memberships.role IN ('owner', 'admin')
            AND tenant_memberships.is_active = true
        )
    );

CREATE POLICY "invitations_update_optimized" ON invitations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM tenant_memberships
            WHERE tenant_memberships.tenant_id = invitations.tenant_id
            AND tenant_memberships.user_id = auth.uid()
            AND tenant_memberships.role IN ('owner', 'admin')
            AND tenant_memberships.is_active = true
        )
    );

CREATE POLICY "invitations_delete_optimized" ON invitations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM tenant_memberships
            WHERE tenant_memberships.tenant_id = invitations.tenant_id
            AND tenant_memberships.user_id = auth.uid()
            AND tenant_memberships.role IN ('owner', 'admin')
            AND tenant_memberships.is_active = true
        )
    );

-- Projects policies
CREATE POLICY "projects_select_optimized" ON projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tenant_memberships
            WHERE tenant_memberships.tenant_id = projects.tenant_id
            AND tenant_memberships.user_id = auth.uid()
            AND tenant_memberships.is_active = true
        )
    );

CREATE POLICY "projects_insert_optimized" ON projects
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM tenant_memberships
            WHERE tenant_memberships.tenant_id = projects.tenant_id
            AND tenant_memberships.user_id = auth.uid()
            AND tenant_memberships.role IN ('owner', 'admin', 'manager')
            AND tenant_memberships.is_active = true
        )
    );

CREATE POLICY "projects_update_optimized" ON projects
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM tenant_memberships
            WHERE tenant_memberships.tenant_id = projects.tenant_id
            AND tenant_memberships.user_id = auth.uid()
            AND tenant_memberships.role IN ('owner', 'admin', 'manager')
            AND tenant_memberships.is_active = true
        )
    );

CREATE POLICY "projects_delete_optimized" ON projects
    FOR DELETE USING (user_can_delete_project(tenant_id));

-- Stages policies
CREATE POLICY "stages_select_optimized" ON stages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tenant_memberships
            WHERE tenant_memberships.tenant_id = stages.tenant_id
            AND tenant_memberships.user_id = auth.uid()
            AND tenant_memberships.is_active = true
        )
    );

CREATE POLICY "stages_insert_optimized" ON stages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM tenant_memberships
            WHERE tenant_memberships.tenant_id = stages.tenant_id
            AND tenant_memberships.user_id = auth.uid()
            AND tenant_memberships.role IN ('owner', 'admin', 'manager')
            AND tenant_memberships.is_active = true
        )
    );

CREATE POLICY "stages_update_optimized" ON stages
    FOR UPDATE USING (
        assigned_to = auth.uid() OR
        EXISTS (
            SELECT 1 FROM tenant_memberships
            WHERE tenant_memberships.tenant_id = stages.tenant_id
            AND tenant_memberships.user_id = auth.uid()
            AND tenant_memberships.role IN ('owner', 'admin', 'manager')
            AND tenant_memberships.is_active = true
        )
    );

CREATE POLICY "stages_delete_optimized" ON stages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM tenant_memberships
            WHERE tenant_memberships.tenant_id = stages.tenant_id
            AND tenant_memberships.user_id = auth.uid()
            AND tenant_memberships.role IN ('owner', 'admin', 'manager')
            AND tenant_memberships.is_active = true
        )
    );

-- Documents policies
CREATE POLICY "documents_select_optimized" ON documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tenant_memberships
            WHERE tenant_memberships.tenant_id = documents.tenant_id
            AND tenant_memberships.user_id = auth.uid()
            AND tenant_memberships.is_active = true
        )
    );

CREATE POLICY "documents_insert_optimized" ON documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM tenant_memberships
            WHERE tenant_memberships.tenant_id = documents.tenant_id
            AND tenant_memberships.user_id = auth.uid()
            AND tenant_memberships.is_active = true
        )
    );

CREATE POLICY "documents_update_optimized" ON documents
    FOR UPDATE USING (
        uploaded_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM tenant_memberships
            WHERE tenant_memberships.tenant_id = documents.tenant_id
            AND tenant_memberships.user_id = auth.uid()
            AND tenant_memberships.role IN ('owner', 'admin', 'manager')
            AND tenant_memberships.is_active = true
        )
    );

CREATE POLICY "documents_delete_optimized" ON documents
    FOR DELETE USING (
        uploaded_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM tenant_memberships
            WHERE tenant_memberships.tenant_id = documents.tenant_id
            AND tenant_memberships.user_id = auth.uid()
            AND tenant_memberships.role IN ('owner', 'admin', 'manager')
            AND tenant_memberships.is_active = true
        )
    );

-- Suppliers policies
CREATE POLICY "suppliers_select_optimized" ON suppliers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tenant_memberships
            WHERE tenant_memberships.tenant_id = suppliers.tenant_id
            AND tenant_memberships.user_id = auth.uid()
            AND tenant_memberships.is_active = true
        )
    );

CREATE POLICY "suppliers_insert_optimized" ON suppliers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM tenant_memberships
            WHERE tenant_memberships.tenant_id = suppliers.tenant_id
            AND tenant_memberships.user_id = auth.uid()
            AND tenant_memberships.role IN ('owner', 'admin', 'manager')
            AND tenant_memberships.is_active = true
        )
    );

CREATE POLICY "suppliers_update_optimized" ON suppliers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM tenant_memberships
            WHERE tenant_memberships.tenant_id = suppliers.tenant_id
            AND tenant_memberships.user_id = auth.uid()
            AND tenant_memberships.role IN ('owner', 'admin', 'manager')
            AND tenant_memberships.is_active = true
        )
    );

CREATE POLICY "suppliers_delete_optimized" ON suppliers
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM tenant_memberships
            WHERE tenant_memberships.tenant_id = suppliers.tenant_id
            AND tenant_memberships.user_id = auth.uid()
            AND tenant_memberships.role IN ('owner', 'admin', 'manager')
            AND tenant_memberships.is_active = true
        )
    );

-- Expenses policies
CREATE POLICY "expenses_select_optimized" ON expenses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tenant_memberships
            WHERE tenant_memberships.tenant_id = expenses.tenant_id
            AND tenant_memberships.user_id = auth.uid()
            AND tenant_memberships.is_active = true
        )
    );

CREATE POLICY "expenses_insert_optimized" ON expenses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM tenant_memberships
            WHERE tenant_memberships.tenant_id = expenses.tenant_id
            AND tenant_memberships.user_id = auth.uid()
            AND tenant_memberships.is_active = true
        )
    );

CREATE POLICY "expenses_update_optimized" ON expenses
    FOR UPDATE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM tenant_memberships
            WHERE tenant_memberships.tenant_id = expenses.tenant_id
            AND tenant_memberships.user_id = auth.uid()
            AND tenant_memberships.role IN ('owner', 'admin', 'manager')
            AND tenant_memberships.is_active = true
        )
    );

CREATE POLICY "expenses_delete_optimized" ON expenses
    FOR DELETE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM tenant_memberships
            WHERE tenant_memberships.tenant_id = expenses.tenant_id
            AND tenant_memberships.user_id = auth.uid()
            AND tenant_memberships.role IN ('owner', 'admin', 'manager')
            AND tenant_memberships.is_active = true
        )
    );

-- Todos policies
CREATE POLICY "todos_select" ON todos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tenant_memberships
            WHERE tenant_memberships.tenant_id = todos.tenant_id
            AND tenant_memberships.user_id = auth.uid()
            AND tenant_memberships.is_active = true
        )
    );

CREATE POLICY "todos_insert" ON todos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM tenant_memberships
            WHERE tenant_memberships.tenant_id = todos.tenant_id
            AND tenant_memberships.user_id = auth.uid()
            AND tenant_memberships.is_active = true
        )
    );

CREATE POLICY "todos_update" ON todos
    FOR UPDATE USING (
        created_by = auth.uid() OR
        assigned_to = auth.uid() OR
        EXISTS (
            SELECT 1 FROM tenant_memberships
            WHERE tenant_memberships.tenant_id = todos.tenant_id
            AND tenant_memberships.user_id = auth.uid()
            AND tenant_memberships.role IN ('owner', 'admin', 'manager')
            AND tenant_memberships.is_active = true
        )
    );

CREATE POLICY "todos_delete" ON todos
    FOR DELETE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM tenant_memberships
            WHERE tenant_memberships.tenant_id = todos.tenant_id
            AND tenant_memberships.user_id = auth.uid()
            AND tenant_memberships.role IN ('owner', 'admin', 'manager')
            AND tenant_memberships.is_active = true
        )
    );

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT ALL ON tenants TO authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON tenant_memberships TO authenticated;
GRANT ALL ON invitations TO authenticated;
GRANT ALL ON projects TO authenticated;
GRANT ALL ON stages TO authenticated;
GRANT ALL ON documents TO authenticated;
GRANT ALL ON suppliers TO authenticated;
GRANT ALL ON expenses TO authenticated;
GRANT ALL ON todos TO authenticated;

COMMIT;
