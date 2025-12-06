-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE project_status AS ENUM ('planning', 'in-progress', 'completed', 'on-hold');
CREATE TYPE stage_status AS ENUM ('not-started', 'in-progress', 'completed');
CREATE TYPE stage_category AS ENUM ('site-work', 'utilities', 'structure', 'interior', 'exterior', 'finishing', 'other');
CREATE TYPE document_type AS ENUM ('permit', 'contract', 'invoice', 'plan', 'photo', 'warranty', 'other');
CREATE TYPE expense_status AS ENUM ('pending', 'paid');
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'manager', 'contractor', 'viewer');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');

-- Tenants table (represents organizations/companies)
CREATE TABLE tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- for friendly URLs like /tenant/acme-construction
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
    permissions JSONB DEFAULT '{}', -- Additional granular permissions
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

-- Projects table (now belongs to tenants)
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
    -- Project-specific permissions
    project_managers UUID[] DEFAULT '{}', -- Array of user IDs with manager access
    contractors UUID[] DEFAULT '{}' -- Array of user IDs with contractor access
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
    assigned_suppliers UUID[] DEFAULT '{}', -- Changed to UUID array for proper references
    dependencies UUID[] DEFAULT '{}', -- Changed to UUID array for proper references
    notes TEXT DEFAULT '',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Who's responsible for this stage
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
    stage_ids UUID[] DEFAULT '{}', -- Changed to UUID array
    supplier_ids UUID[] DEFAULT '{}', -- Changed to UUID array
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    size TEXT NOT NULL,
    url TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    notes TEXT DEFAULT '',
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Suppliers table
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
    stage_ids UUID[] DEFAULT '{}', -- Changed to UUID array
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

-- Create indexes for better performance
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenant_memberships_tenant_id ON tenant_memberships(tenant_id);
CREATE INDEX idx_tenant_memberships_user_id ON tenant_memberships(user_id);
CREATE INDEX idx_tenant_memberships_active ON tenant_memberships(tenant_id, user_id) WHERE is_active = true;
CREATE INDEX idx_invitations_tenant_id ON invitations(tenant_id);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_projects_tenant_id ON projects(tenant_id);
CREATE INDEX idx_stages_project_id ON stages(project_id);
CREATE INDEX idx_stages_tenant_id ON stages(tenant_id);
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_tenant_id ON documents(tenant_id);
CREATE INDEX idx_suppliers_project_id ON suppliers(project_id);
CREATE INDEX idx_suppliers_tenant_id ON suppliers(tenant_id);
CREATE INDEX idx_expenses_project_id ON expenses(project_id);
CREATE INDEX idx_expenses_tenant_id ON expenses(tenant_id);
CREATE INDEX idx_expenses_stage_id ON expenses(stage_id);
CREATE INDEX idx_expenses_supplier_id ON expenses(supplier_id);

-- Enable Row Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user has access to tenant
CREATE OR REPLACE FUNCTION user_has_tenant_access(tenant_uuid UUID, required_role user_role DEFAULT 'viewer')
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user can modify resource
CREATE OR REPLACE FUNCTION user_can_modify_tenant_resource(tenant_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM tenant_memberships 
        WHERE tenant_id = tenant_uuid 
        AND user_id = auth.uid() 
        AND is_active = true
        AND role IN ('owner', 'admin', 'manager')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies
-- Tenants policies
CREATE POLICY "Users can view tenants they belong to" ON tenants
    FOR SELECT USING (user_has_tenant_access(id));

CREATE POLICY "Users can create tenants" ON tenants
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Owners and admins can update tenants" ON tenants
    FOR UPDATE USING (user_can_modify_tenant_resource(id));

CREATE POLICY "Only owners can delete tenants" ON tenants
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM tenant_memberships 
            WHERE tenant_id = id 
            AND user_id = auth.uid() 
            AND role = 'owner'
        )
    );

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Tenant memberships policies
CREATE POLICY "Users can view memberships of their tenants" ON tenant_memberships
    FOR SELECT USING (user_has_tenant_access(tenant_id));

CREATE POLICY "Admins can manage memberships" ON tenant_memberships
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tenant_memberships tm
            WHERE tm.tenant_id = tenant_memberships.tenant_id 
            AND tm.user_id = auth.uid() 
            AND tm.role IN ('owner', 'admin')
        )
    );

-- Invitations policies
CREATE POLICY "Users can view invitations for their tenants" ON invitations
    FOR SELECT USING (user_has_tenant_access(tenant_id));

CREATE POLICY "Admins can manage invitations" ON invitations
    FOR ALL USING (user_can_modify_tenant_resource(tenant_id));

-- Projects policies
CREATE POLICY "Users can view projects in their tenants" ON projects
    FOR SELECT USING (user_has_tenant_access(tenant_id));

CREATE POLICY "Managers can create projects" ON projects
    FOR INSERT WITH CHECK (user_can_modify_tenant_resource(tenant_id));

CREATE POLICY "Managers can update projects" ON projects
    FOR UPDATE USING (user_can_modify_tenant_resource(tenant_id));

CREATE POLICY "Admins can delete projects" ON projects
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM tenant_memberships 
            WHERE tenant_id = projects.tenant_id 
            AND user_id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

-- Stages policies
CREATE POLICY "Users can view stages in their tenants" ON stages
    FOR SELECT USING (user_has_tenant_access(tenant_id));

CREATE POLICY "Contractors can create stages" ON stages
    FOR INSERT WITH CHECK (user_has_tenant_access(tenant_id, 'contractor'));

CREATE POLICY "Contractors can update stages" ON stages
    FOR UPDATE USING (
        user_has_tenant_access(tenant_id, 'contractor') OR 
        assigned_to = auth.uid()
    );

CREATE POLICY "Managers can delete stages" ON stages
    FOR DELETE USING (user_can_modify_tenant_resource(tenant_id));

-- Documents policies
CREATE POLICY "Users can view documents in their tenants" ON documents
    FOR SELECT USING (user_has_tenant_access(tenant_id));

CREATE POLICY "Contractors can upload documents" ON documents
    FOR INSERT WITH CHECK (user_has_tenant_access(tenant_id, 'contractor'));

CREATE POLICY "Users can update their own documents or managers can update any" ON documents
    FOR UPDATE USING (
        uploaded_by = auth.uid() OR 
        user_can_modify_tenant_resource(tenant_id)
    );

CREATE POLICY "Managers can delete documents" ON documents
    FOR DELETE USING (user_can_modify_tenant_resource(tenant_id));

-- Suppliers policies
CREATE POLICY "Users can view suppliers in their tenants" ON suppliers
    FOR SELECT USING (user_has_tenant_access(tenant_id));

CREATE POLICY "Managers can create suppliers" ON suppliers
    FOR INSERT WITH CHECK (user_can_modify_tenant_resource(tenant_id));

CREATE POLICY "Managers can update suppliers" ON suppliers
    FOR UPDATE USING (user_can_modify_tenant_resource(tenant_id));

CREATE POLICY "Managers can delete suppliers" ON suppliers
    FOR DELETE USING (user_can_modify_tenant_resource(tenant_id));

-- Expenses policies
CREATE POLICY "Users can view expenses in their tenants" ON expenses
    FOR SELECT USING (user_has_tenant_access(tenant_id));

CREATE POLICY "Contractors can create expenses" ON expenses
    FOR INSERT WITH CHECK (user_has_tenant_access(tenant_id, 'contractor'));

CREATE POLICY "Users can update their own expenses or managers can update any" ON expenses
    FOR UPDATE USING (
        created_by = auth.uid() OR 
        user_can_modify_tenant_resource(tenant_id)
    );

CREATE POLICY "Managers can delete expenses" ON expenses
    FOR DELETE USING (user_can_modify_tenant_resource(tenant_id));

-- Functions to automatically update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stages_updated_at BEFORE UPDATE ON stages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update project actual_spent when expenses change
CREATE OR REPLACE FUNCTION update_project_actual_spent()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the project's actual_spent based on all expenses
    UPDATE projects 
    SET actual_spent = (
        SELECT COALESCE(SUM(amount), 0) 
        FROM expenses 
        WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
        AND status = 'paid'
    )
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Triggers for updating project actual_spent
CREATE TRIGGER update_project_spent_on_expense_insert 
    AFTER INSERT ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_project_actual_spent();

CREATE TRIGGER update_project_spent_on_expense_update 
    AFTER UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_project_actual_spent();

CREATE TRIGGER update_project_spent_on_expense_delete 
    AFTER DELETE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_project_actual_spent();
