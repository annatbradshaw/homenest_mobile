import {
  createTestClient,
  createServiceClient,
  signInTestUser,
  cleanupTestData,
  createTestProject,
  TEST_TENANT_ID,
} from '../utils/supabase-test-client';

describe('Projects API', () => {
  const client = createTestClient();
  const serviceClient = createServiceClient();
  let userId: string;

  beforeAll(async () => {
    // Sign in test user
    const { user } = await signInTestUser(client);
    userId = user.id;
  });

  afterAll(async () => {
    await cleanupTestData(serviceClient);
    await client.auth.signOut();
  });

  describe('Create Project', () => {
    it('should create a new project', async () => {
      const project = await createTestProject(serviceClient, userId, {
        name: 'Test Kitchen Renovation',
        description: 'A test project for kitchen renovation',
      });

      expect(project).toBeDefined();
      expect(project.name).toBe('Test Kitchen Renovation');
      expect(project.description).toBe('A test project for kitchen renovation');
      expect(project.tenant_id).toBe(TEST_TENANT_ID);
      expect(project.status).toBe('planning');
    });
  });

  describe('Read Projects', () => {
    it('should list projects for authenticated user', async () => {
      // Create a project first
      await createTestProject(serviceClient, userId, {
        name: 'Bathroom Remodel',
      });

      // Query as authenticated user
      const { data: projects, error } = await client
        .from('projects')
        .select('*')
        .eq('tenant_id', TEST_TENANT_ID);

      expect(error).toBeNull();
      expect(projects).toBeDefined();
      expect(projects!.length).toBeGreaterThan(0);
    });
  });

  describe('Update Project', () => {
    it('should update project status', async () => {
      const project = await createTestProject(serviceClient, userId, {
        name: 'Project to Update',
      });

      const { data: updated, error } = await serviceClient
        .from('projects')
        .update({ status: 'in-progress' })
        .eq('id', project.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updated!.status).toBe('in-progress');
    });
  });

  describe('Delete Project', () => {
    it('should delete a project', async () => {
      const project = await createTestProject(serviceClient, userId, {
        name: 'Project to Delete',
      });

      const { error } = await serviceClient
        .from('projects')
        .delete()
        .eq('id', project.id);

      expect(error).toBeNull();

      // Verify deletion
      const { data: deleted } = await serviceClient
        .from('projects')
        .select()
        .eq('id', project.id)
        .single();

      expect(deleted).toBeNull();
    });
  });
});
