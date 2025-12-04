// Database types based on OpenAPI specification

export type UUID = string;

// Enums
export type ProjectStatus = 'planning' | 'in-progress' | 'completed' | 'on-hold';
export type StageStatus = 'not-started' | 'in-progress' | 'completed';
export type StageCategory = 'site-work' | 'utilities' | 'structure' | 'interior' | 'exterior' | 'finishing' | 'other';
export type TodoPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TodoStatus = 'todo' | 'in-progress' | 'completed' | 'cancelled';
export type ExpenseStatus = 'pending' | 'paid';
export type DocumentType = 'permit' | 'contract' | 'invoice' | 'plan' | 'photo' | 'warranty' | 'financing' | 'other';
export type MemberRole = 'owner' | 'admin' | 'manager' | 'contractor' | 'viewer';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

// Base interfaces
export interface Timestamps {
  created_at: string;
  updated_at: string;
}

export interface Auditable extends Timestamps {
  created_by?: UUID;
}

// Core entities
export interface Tenant extends Auditable {
  id: UUID;
  name: string;
  slug: string;
  description?: string;
  settings?: Record<string, unknown>;
}

export interface UserProfile extends Timestamps {
  id: UUID;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  phone?: string;
  timezone?: string;
  preferences?: Record<string, unknown>;
}

export interface TenantMembership extends Timestamps {
  id: UUID;
  tenant_id: UUID;
  user_id: UUID;
  role: MemberRole;
  permissions?: Record<string, unknown>;
  is_active: boolean;
  joined_at: string;
  // Relations
  tenant?: Tenant;
  user_profile?: UserProfile;
}

export interface Project extends Auditable {
  id: UUID;
  tenant_id: UUID;
  name: string;
  description?: string;
  address?: string;
  start_date?: string;
  target_completion_date?: string;
  total_budget?: number;
  actual_spent?: number;
  status: ProjectStatus;
  // Relations
  stages?: Stage[];
  todos?: Todo[];
  expenses?: Expense[];
  documents?: Document[];
  suppliers?: Supplier[];
}

export interface Stage extends Auditable {
  id: UUID;
  project_id: UUID;
  name: string;
  description?: string;
  status: StageStatus;
  category: StageCategory;
  planned_start_date?: string;
  planned_end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  estimated_cost?: number;
  actual_cost?: number;
  assigned_suppliers?: UUID[];
  dependencies?: UUID[];
  // Relations
  project?: Project;
}

export interface Todo extends Auditable {
  id: UUID;
  project_id: UUID;
  title: string;
  description?: string;
  priority: TodoPriority;
  status: TodoStatus;
  due_date?: string;
  assigned_to?: UUID;
  stage_ids?: UUID[];
  tags?: string[];
  is_completed: boolean;
  completed_at?: string;
  // Relations
  project?: Project;
  assigned_user?: UserProfile;
}

export interface Expense extends Auditable {
  id: UUID;
  project_id: UUID;
  date: string;
  amount: number;
  category?: string;
  stage_id?: UUID;
  supplier_id?: UUID;
  description?: string;
  receipt_url?: string;
  status: ExpenseStatus;
  payment_method?: string;
  // Relations
  project?: Project;
  stage?: Stage;
  supplier?: Supplier;
}

export interface Document extends Auditable {
  id: UUID;
  project_id: UUID;
  name: string;
  type: DocumentType;
  category?: string;
  stage_ids?: UUID[];
  supplier_ids?: UUID[];
  url: string;
  size?: number;
  upload_date: string;
  tags?: string[];
  notes?: string;
  uploaded_by?: UUID;
  // Relations
  project?: Project;
}

export interface Supplier extends Auditable {
  id: UUID;
  project_id: UUID;
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  address?: string;
  specialty?: string;
  contract_value?: number;
  payment_terms?: string;
  rating?: number;
  is_active: boolean;
  stage_ids?: UUID[];
  // Relations
  project?: Project;
}

export interface ProjectMember extends Timestamps {
  id: UUID;
  project_id: UUID;
  invitation_email: string;
  role: MemberRole;
  allowed_stage_ids?: UUID[];
  linked_supplier_id?: UUID;
  invitation_token: string;
  invitation_status: InvitationStatus;
  invited_by: UUID;
  accepted_at?: string;
  expires_at: string;
  user_id?: UUID;
  // Relations
  project?: Project;
  user_profile?: UserProfile;
}

export interface Invitation extends Timestamps {
  id: UUID;
  tenant_id: UUID;
  email: string;
  role: MemberRole;
  token: string;
  status: InvitationStatus;
  invited_by: UUID;
  expires_at: string;
  accepted_at?: string;
}

// API Request/Response types
export interface CreateProjectRequest {
  name: string;
  description?: string;
  address?: string;
  start_date?: string;
  target_completion_date?: string;
  total_budget?: number;
  status?: ProjectStatus;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {}

export interface CreateStageRequest {
  project_id: UUID;
  name: string;
  description?: string;
  status?: StageStatus;
  category: StageCategory;
  planned_start_date?: string;
  planned_end_date?: string;
  estimated_cost?: number;
  assigned_suppliers?: UUID[];
  dependencies?: UUID[];
}

export interface UpdateStageRequest extends Partial<Omit<CreateStageRequest, 'project_id'>> {}

export interface CreateTodoRequest {
  project_id: UUID;
  title: string;
  description?: string;
  priority?: TodoPriority;
  status?: TodoStatus;
  due_date?: string;
  assigned_to?: UUID;
  stage_ids?: UUID[];
  tags?: string[];
}

export interface UpdateTodoRequest extends Partial<Omit<CreateTodoRequest, 'project_id'>> {}

export interface CreateExpenseRequest {
  project_id: UUID;
  date: string;
  amount: number;
  category?: string;
  stage_id?: UUID;
  supplier_id?: UUID;
  description?: string;
  status?: ExpenseStatus;
  payment_method?: string;
}

export interface UpdateExpenseRequest extends Partial<Omit<CreateExpenseRequest, 'project_id'>> {}

export interface CreateSupplierRequest {
  project_id: UUID;
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  address?: string;
  specialty?: string;
  contract_value?: number;
  payment_terms?: string;
  rating?: number;
  stage_ids?: UUID[];
}

export interface UpdateSupplierRequest extends Partial<Omit<CreateSupplierRequest, 'project_id'>> {}

export interface CreateDocumentRequest {
  project_id: UUID;
  name: string;
  type: DocumentType;
  category?: string;
  stage_ids?: UUID[];
  supplier_ids?: UUID[];
  tags?: string[];
  notes?: string;
}

export interface InviteToProjectRequest {
  email: string;
  role: MemberRole;
  allowed_stage_ids?: UUID[];
  linked_supplier_id?: UUID;
}
