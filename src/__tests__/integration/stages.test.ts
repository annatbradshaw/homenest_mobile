import {
  createTestClient,
  createServiceClient,
  signInTestUser,
  cleanupTestData,
  createTestProject,
  TEST_TENANT_ID,
} from '../utils/supabase-test-client';

describe('Stages API', () => {
  const client = createTestClient();
  const serviceClient = createServiceClient();
  let userId: string;
  let projectId: string;

  beforeAll(async () => {
    // Sign in test user
    const { user } = await signInTestUser(client);
    userId = user.id;

    // Create a test project
    const project = await createTestProject(serviceClient, userId, {
      name: 'Test Project for Stages',
    });
    projectId = project.id;
  });

  afterAll(async () => {
    await cleanupTestData(serviceClient);
    await client.auth.signOut();
  });

  describe('Create Stage', () => {
    it('should create a new stage', async () => {
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const { data: stage, error } = await serviceClient
        .from('stages')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          name: 'Foundation Work',
          description: 'Laying the foundation',
          category: 'structure',
          status: 'not-started',
          estimated_cost: 15000,
          planned_start_date: today,
          planned_end_date: futureDate,
          created_by: userId,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(stage).toBeDefined();
      expect(stage!.name).toBe('Foundation Work');
      expect(stage!.category).toBe('structure');
      expect(stage!.estimated_cost).toBe(15000);
    });
  });

  describe('Read Stages', () => {
    it('should list stages for a project', async () => {
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Create a stage first
      await serviceClient.from('stages').insert({
        project_id: projectId,
        tenant_id: TEST_TENANT_ID,
        name: 'Electrical Work',
        description: 'Installing electrical systems',
        category: 'utilities',
        status: 'not-started',
        planned_start_date: today,
        planned_end_date: futureDate,
        created_by: userId,
      });

      const { data: stages, error } = await client
        .from('stages')
        .select('*')
        .eq('project_id', projectId);

      expect(error).toBeNull();
      expect(stages).toBeDefined();
      expect(stages!.length).toBeGreaterThan(0);
    });
  });

  describe('Update Stage', () => {
    it('should update stage status and dates', async () => {
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const { data: stage, error: insertError } = await serviceClient
        .from('stages')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          name: 'Plumbing Update Test',
          description: 'Testing plumbing updates',
          category: 'utilities',
          status: 'not-started',
          planned_start_date: today,
          planned_end_date: futureDate,
          created_by: userId,
        })
        .select()
        .single();

      expect(insertError).toBeNull();
      expect(stage).toBeDefined();

      const { data: updated, error } = await serviceClient
        .from('stages')
        .update({
          status: 'in-progress',
          actual_start_date: today,
        })
        .eq('id', stage!.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updated!.status).toBe('in-progress');
      expect(updated!.actual_start_date).toBe(today);
    });
  });

  describe('Stage with Dependencies', () => {
    it('should create stages with dependencies', async () => {
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const laterDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Create first stage
      const { data: stage1, error: error1 } = await serviceClient
        .from('stages')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          name: 'Site Prep Dependency Test',
          description: 'Preparing site for construction',
          category: 'site-work',
          status: 'completed',
          planned_start_date: today,
          planned_end_date: futureDate,
          created_by: userId,
        })
        .select()
        .single();

      expect(error1).toBeNull();
      expect(stage1).toBeDefined();

      // Create second stage that depends on first
      const { data: stage2, error } = await serviceClient
        .from('stages')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          name: 'Framing',
          description: 'Building the frame structure',
          category: 'structure',
          status: 'not-started',
          planned_start_date: futureDate,
          planned_end_date: laterDate,
          dependencies: [stage1!.id],
          created_by: userId,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(stage2!.dependencies).toContain(stage1!.id);
    });
  });
});
