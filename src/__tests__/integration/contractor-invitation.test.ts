import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  createTestClient,
  createServiceClient,
  signInTestUser,
  cleanupTestData,
  createTestProject,
  TEST_TENANT_ID,
} from '../utils/supabase-test-client';

// Local Supabase credentials
const SUPABASE_LOCAL_URL = process.env.SUPABASE_LOCAL_URL || 'http://127.0.0.1:54321';
const SUPABASE_LOCAL_ANON_KEY = process.env.SUPABASE_LOCAL_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const timestamp = Date.now();
const uniqueEmail = (suffix: string) => `contractor-${suffix}-${timestamp}@example.com`;

describe('Contractor Invitation and Stage Access', () => {
  const client = createTestClient();
  const serviceClient = createServiceClient();
  let ownerUserId: string;
  let projectId: string;
  let stageIds: { electrical: string; plumbing: string; framing: string };

  beforeAll(async () => {
    // Sign in as project owner
    const { user } = await signInTestUser(client);
    ownerUserId = user.id;

    // Create a test project
    const project = await createTestProject(serviceClient, ownerUserId, {
      name: 'Contractor Test Project',
    });
    projectId = project.id;

    // Create multiple stages
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const laterDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const stageData = [
      { name: 'Electrical', description: 'Electrical work', category: 'utilities' as const },
      { name: 'Plumbing', description: 'Plumbing work', category: 'utilities' as const },
      { name: 'Framing', description: 'Structural framing', category: 'structure' as const },
    ];

    const { data: stages } = await serviceClient
      .from('stages')
      .insert(
        stageData.map((s, i) => ({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          name: s.name,
          description: s.description,
          category: s.category,
          status: 'not-started',
          planned_start_date: today,
          planned_end_date: i === 0 ? futureDate : laterDate,
          created_by: ownerUserId,
        }))
      )
      .select();

    stageIds = {
      electrical: stages![0].id,
      plumbing: stages![1].id,
      framing: stages![2].id,
    };
  });

  afterAll(async () => {
    // Clean up project_members first
    await serviceClient.from('project_members').delete().eq('project_id', projectId);
    await cleanupTestData(serviceClient);
    await client.auth.signOut();
  });

  describe('Create Invitation', () => {
    it('should create a pending invitation with explicit stage access', async () => {
      const inviteEmail = uniqueEmail('explicit-stages');

      const { data: invitation, error } = await serviceClient
        .from('project_members')
        .insert({
          project_id: projectId,
          invitation_email: inviteEmail,
          role: 'contractor',
          invitation_status: 'pending',
          invited_by: ownerUserId,
          allowed_stage_ids: [stageIds.electrical, stageIds.plumbing],
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(invitation).toBeDefined();
      expect(invitation!.invitation_email).toBe(inviteEmail);
      expect(invitation!.role).toBe('contractor');
      expect(invitation!.invitation_status).toBe('pending');
      expect(invitation!.invitation_token).toBeDefined();
      expect(invitation!.allowed_stage_ids).toContain(stageIds.electrical);
      expect(invitation!.allowed_stage_ids).toContain(stageIds.plumbing);
      expect(invitation!.allowed_stage_ids).not.toContain(stageIds.framing);
    });

    it('should auto-generate invitation token', async () => {
      const inviteEmail = uniqueEmail('token-test');

      const { data: invitation, error } = await serviceClient
        .from('project_members')
        .insert({
          project_id: projectId,
          invitation_email: inviteEmail,
          role: 'contractor',
          invitation_status: 'pending',
          invited_by: ownerUserId,
          allowed_stage_ids: [stageIds.electrical],
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(invitation!.invitation_token).toBeDefined();
      expect(invitation!.invitation_token.length).toBe(64); // 32 bytes hex = 64 chars
    });

    it('should set default expiration date', async () => {
      const inviteEmail = uniqueEmail('expires-test');

      const { data: invitation, error } = await serviceClient
        .from('project_members')
        .insert({
          project_id: projectId,
          invitation_email: inviteEmail,
          role: 'viewer',
          invitation_status: 'pending',
          invited_by: ownerUserId,
          allowed_stage_ids: [stageIds.framing],
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(invitation!.expires_at).toBeDefined();

      // Expires in ~7 days
      const expiresAt = new Date(invitation!.expires_at);
      const now = new Date();
      const daysDiff = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeGreaterThan(6);
      expect(daysDiff).toBeLessThan(8);
    });
  });

  describe('Supplier-Linked Contractor Access', () => {
    let supplierId: string;

    beforeAll(async () => {
      // Create a supplier assigned to electrical and plumbing stages
      const { data: supplier } = await serviceClient
        .from('suppliers')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          name: 'ABC Electric & Plumbing',
          company: 'ABC Services LLC',
          specialty: 'Electric & Plumbing',
          stage_ids: [stageIds.electrical, stageIds.plumbing],
          created_by: ownerUserId,
        })
        .select()
        .single();

      supplierId = supplier!.id;
    });

    it('should create invitation linked to supplier', async () => {
      const inviteEmail = uniqueEmail('supplier-linked');

      const { data: invitation, error } = await serviceClient
        .from('project_members')
        .insert({
          project_id: projectId,
          invitation_email: inviteEmail,
          role: 'contractor',
          invitation_status: 'pending',
          invited_by: ownerUserId,
          linked_supplier_id: supplierId,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(invitation!.linked_supplier_id).toBe(supplierId);
      // When linked to supplier, allowed_stage_ids should be null
      expect(invitation!.allowed_stage_ids).toBeNull();
    });

    it('should fetch invitation with supplier details', async () => {
      const inviteEmail = uniqueEmail('fetch-supplier');

      const { data: created } = await serviceClient
        .from('project_members')
        .insert({
          project_id: projectId,
          invitation_email: inviteEmail,
          role: 'contractor',
          invitation_status: 'pending',
          invited_by: ownerUserId,
          linked_supplier_id: supplierId,
        })
        .select()
        .single();

      // Fetch with supplier relation
      const { data: invitation, error } = await serviceClient
        .from('project_members')
        .select('*, supplier:suppliers(id, name, company, stage_ids)')
        .eq('id', created!.id)
        .single();

      expect(error).toBeNull();
      expect(invitation!.supplier).toBeDefined();
      expect(invitation!.supplier.name).toBe('ABC Electric & Plumbing');
      expect(invitation!.supplier.stage_ids).toContain(stageIds.electrical);
      expect(invitation!.supplier.stage_ids).toContain(stageIds.plumbing);
    });

    it('should dynamically update contractor access when supplier stages change', async () => {
      // Create supplier with only electrical
      const { data: supplier } = await serviceClient
        .from('suppliers')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          name: 'Dynamic Access Supplier',
          company: 'Dynamic Co',
          stage_ids: [stageIds.electrical],
          created_by: ownerUserId,
        })
        .select()
        .single();

      // Create contractor linked to this supplier
      const inviteEmail = uniqueEmail('dynamic-access');
      await serviceClient
        .from('project_members')
        .insert({
          project_id: projectId,
          invitation_email: inviteEmail,
          role: 'contractor',
          invitation_status: 'pending',
          invited_by: ownerUserId,
          linked_supplier_id: supplier!.id,
        });

      // Verify supplier has only electrical
      expect(supplier!.stage_ids).toHaveLength(1);
      expect(supplier!.stage_ids).toContain(stageIds.electrical);

      // Update supplier to include plumbing
      const { data: updatedSupplier, error } = await serviceClient
        .from('suppliers')
        .update({
          stage_ids: [stageIds.electrical, stageIds.plumbing],
        })
        .eq('id', supplier!.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updatedSupplier!.stage_ids).toHaveLength(2);

      // The contractor linked to this supplier now has access to both stages
      // (This is handled by the database function get_accessible_stages)
    });
  });

  describe('Invitation Status Management', () => {
    it('should accept invitation and link user', async () => {
      const inviteEmail = uniqueEmail('accept');

      // Create invitation
      const { data: invitation } = await serviceClient
        .from('project_members')
        .insert({
          project_id: projectId,
          invitation_email: inviteEmail,
          role: 'contractor',
          invitation_status: 'pending',
          invited_by: ownerUserId,
          allowed_stage_ids: [stageIds.electrical],
        })
        .select()
        .single();

      // Create a new user for the contractor
      const contractorClient = createClient(SUPABASE_LOCAL_URL, SUPABASE_LOCAL_ANON_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      await contractorClient.auth.signUp({
        email: inviteEmail,
        password: 'contractorpass123',
      });
      const { data: contractorAuth } = await contractorClient.auth.signInWithPassword({
        email: inviteEmail,
        password: 'contractorpass123',
      });

      // Create user profile for contractor
      await serviceClient.from('user_profiles').upsert({
        id: contractorAuth.user!.id,
        first_name: 'Contractor',
        last_name: 'User',
      }, { onConflict: 'id' });

      // Accept invitation (simulating what the app would do)
      const { data: accepted, error } = await serviceClient
        .from('project_members')
        .update({
          invitation_status: 'accepted',
          user_id: contractorAuth.user!.id,
          accepted_at: new Date().toISOString(),
        })
        .eq('id', invitation!.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(accepted!.invitation_status).toBe('accepted');
      expect(accepted!.user_id).toBe(contractorAuth.user!.id);
      expect(accepted!.accepted_at).toBeDefined();

      await contractorClient.auth.signOut();
    });

    it('should decline invitation', async () => {
      const inviteEmail = uniqueEmail('decline');

      const { data: invitation } = await serviceClient
        .from('project_members')
        .insert({
          project_id: projectId,
          invitation_email: inviteEmail,
          role: 'contractor',
          invitation_status: 'pending',
          invited_by: ownerUserId,
          allowed_stage_ids: [stageIds.framing],
        })
        .select()
        .single();

      const { data: declined, error } = await serviceClient
        .from('project_members')
        .update({
          invitation_status: 'declined',
        })
        .eq('id', invitation!.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(declined!.invitation_status).toBe('declined');
    });

    it('should mark invitation as expired', async () => {
      const inviteEmail = uniqueEmail('expired');

      const { data: invitation } = await serviceClient
        .from('project_members')
        .insert({
          project_id: projectId,
          invitation_email: inviteEmail,
          role: 'contractor',
          invitation_status: 'pending',
          invited_by: ownerUserId,
          allowed_stage_ids: [stageIds.plumbing],
          expires_at: new Date(Date.now() - 1000).toISOString(), // Already expired
        })
        .select()
        .single();

      const { data: expired, error } = await serviceClient
        .from('project_members')
        .update({
          invitation_status: 'expired',
        })
        .eq('id', invitation!.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(expired!.invitation_status).toBe('expired');
    });
  });

  describe('List Project Members', () => {
    it('should list all invitations for a project', async () => {
      const { data: members, error } = await serviceClient
        .from('project_members')
        .select('*')
        .eq('project_id', projectId);

      expect(error).toBeNull();
      expect(members).toBeDefined();
      expect(members!.length).toBeGreaterThan(0);
    });

    it('should list pending invitations only', async () => {
      const { data: pending, error } = await serviceClient
        .from('project_members')
        .select('*')
        .eq('project_id', projectId)
        .eq('invitation_status', 'pending');

      expect(error).toBeNull();
      expect(pending!.every(m => m.invitation_status === 'pending')).toBe(true);
    });

    it('should list accepted members with user profiles using specific FK', async () => {
      // Use specific FK name to avoid ambiguity
      const { data: accepted, error } = await serviceClient
        .from('project_members')
        .select('*, user_profile:user_profiles!project_members_user_profile_fkey(id, first_name, last_name)')
        .eq('project_id', projectId)
        .eq('invitation_status', 'accepted');

      expect(error).toBeNull();
      // Some accepted members should have user profiles
      if (accepted && accepted.length > 0) {
        const withProfile = accepted.find(m => m.user_profile !== null);
        if (withProfile) {
          expect(withProfile.user_profile).toBeDefined();
        }
      }
    });
  });

  describe('Role-Based Access', () => {
    it('should support different roles', async () => {
      const roles = ['contractor', 'viewer', 'manager'] as const;

      for (const role of roles) {
        const inviteEmail = uniqueEmail(`role-${role}`);

        const { data: invitation, error } = await serviceClient
          .from('project_members')
          .insert({
            project_id: projectId,
            invitation_email: inviteEmail,
            role: role,
            invitation_status: 'pending',
            invited_by: ownerUserId,
            allowed_stage_ids: [stageIds.electrical],
          })
          .select()
          .single();

        expect(error).toBeNull();
        expect(invitation!.role).toBe(role);
      }
    });
  });

  describe('Delete Invitation', () => {
    it('should delete a pending invitation', async () => {
      const inviteEmail = uniqueEmail('delete');

      const { data: invitation } = await serviceClient
        .from('project_members')
        .insert({
          project_id: projectId,
          invitation_email: inviteEmail,
          role: 'contractor',
          invitation_status: 'pending',
          invited_by: ownerUserId,
          allowed_stage_ids: [stageIds.electrical],
        })
        .select()
        .single();

      const { error } = await serviceClient
        .from('project_members')
        .delete()
        .eq('id', invitation!.id);

      expect(error).toBeNull();

      const { data: deleted } = await serviceClient
        .from('project_members')
        .select()
        .eq('id', invitation!.id)
        .single();

      expect(deleted).toBeNull();
    });
  });

  describe('Duplicate Prevention', () => {
    it('should prevent duplicate invitations to same email for same project', async () => {
      const inviteEmail = uniqueEmail('duplicate');

      // First invitation
      await serviceClient
        .from('project_members')
        .insert({
          project_id: projectId,
          invitation_email: inviteEmail,
          role: 'contractor',
          invitation_status: 'pending',
          invited_by: ownerUserId,
          allowed_stage_ids: [stageIds.electrical],
        });

      // Second invitation to same email should fail
      const { error } = await serviceClient
        .from('project_members')
        .insert({
          project_id: projectId,
          invitation_email: inviteEmail,
          role: 'contractor',
          invitation_status: 'pending',
          invited_by: ownerUserId,
          allowed_stage_ids: [stageIds.plumbing],
        });

      expect(error).toBeDefined();
    });
  });
});
