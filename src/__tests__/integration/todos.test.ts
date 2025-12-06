import {
  createTestClient,
  createServiceClient,
  signInTestUser,
  cleanupTestData,
  createTestProject,
  TEST_TENANT_ID,
} from '../utils/supabase-test-client';

describe('Todos API', () => {
  const client = createTestClient();
  const serviceClient = createServiceClient();
  let userId: string;
  let projectId: string;
  let stageId: string;

  beforeAll(async () => {
    const { user } = await signInTestUser(client);
    userId = user.id;

    const project = await createTestProject(serviceClient, userId, {
      name: 'Test Project for Todos',
    });
    projectId = project.id;

    // Create a stage for todos
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data: stage } = await serviceClient
      .from('stages')
      .insert({
        project_id: projectId,
        tenant_id: TEST_TENANT_ID,
        name: 'Test Stage for Todos',
        description: 'Stage used for todo tests',
        category: 'structure',
        status: 'in-progress',
        planned_start_date: today,
        planned_end_date: futureDate,
        created_by: userId,
      })
      .select()
      .single();

    stageId = stage!.id;
  });

  afterAll(async () => {
    await cleanupTestData(serviceClient);
    await client.auth.signOut();
  });

  describe('Create Todo', () => {
    it('should create a new todo', async () => {
      const { data: todo, error } = await serviceClient
        .from('todos')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          stage_ids: [stageId],
          title: 'Buy materials',
          description: 'Purchase wood and nails',
          priority: 'high',
          status: 'todo',
          created_by: userId,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(todo).toBeDefined();
      expect(todo!.title).toBe('Buy materials');
      expect(todo!.priority).toBe('high');
      expect(todo!.status).toBe('todo');
    });

    it('should create a todo with due date and assignee', async () => {
      const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const { data: todo, error } = await serviceClient
        .from('todos')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          stage_ids: [stageId],
          title: 'Schedule inspection',
          description: 'Book city inspector for foundation',
          priority: 'medium',
          status: 'todo',
          due_date: dueDate,
          assigned_to: userId,
          created_by: userId,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(todo!.due_date).toBe(dueDate);
      expect(todo!.assigned_to).toBe(userId);
    });

    it('should create a todo with tags', async () => {
      const { data: todo, error } = await serviceClient
        .from('todos')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          title: 'Tagged todo',
          priority: 'low',
          status: 'todo',
          tags: ['urgent', 'permits'],
          created_by: userId,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(todo!.tags).toContain('urgent');
      expect(todo!.tags).toContain('permits');
    });
  });

  describe('Read Todos', () => {
    it('should list todos for a project', async () => {
      const { data: todos, error } = await client
        .from('todos')
        .select('*')
        .eq('project_id', projectId);

      expect(error).toBeNull();
      expect(todos).toBeDefined();
      expect(todos!.length).toBeGreaterThan(0);
    });

    it('should filter todos by status', async () => {
      const { data: todos, error } = await client
        .from('todos')
        .select('*')
        .eq('project_id', projectId)
        .eq('status', 'todo');

      expect(error).toBeNull();
      expect(todos!.every(t => t.status === 'todo')).toBe(true);
    });

    it('should filter todos by priority', async () => {
      const { data: todos, error } = await client
        .from('todos')
        .select('*')
        .eq('project_id', projectId)
        .eq('priority', 'high');

      expect(error).toBeNull();
      expect(todos!.every(t => t.priority === 'high')).toBe(true);
    });
  });

  describe('Update Todo', () => {
    it('should update todo status to completed', async () => {
      const { data: todo, error: insertError } = await serviceClient
        .from('todos')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          title: 'Todo to complete',
          description: 'This will be marked complete',
          priority: 'low',
          status: 'todo',
          created_by: userId,
        })
        .select()
        .single();

      expect(insertError).toBeNull();

      const { data: updated, error } = await serviceClient
        .from('todos')
        .update({
          status: 'completed',
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', todo!.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updated!.status).toBe('completed');
      expect(updated!.is_completed).toBe(true);
      expect(updated!.completed_at).toBeDefined();
    });

    it('should update todo priority and assignee', async () => {
      const { data: todo, error: insertError } = await serviceClient
        .from('todos')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          title: 'Todo to reassign',
          description: 'Will change priority and assignee',
          priority: 'low',
          status: 'todo',
          created_by: userId,
        })
        .select()
        .single();

      expect(insertError).toBeNull();

      const { data: updated, error } = await serviceClient
        .from('todos')
        .update({
          priority: 'high',
          assigned_to: userId,
        })
        .eq('id', todo!.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updated!.priority).toBe('high');
      expect(updated!.assigned_to).toBe(userId);
    });

    it('should update todo to in-progress', async () => {
      const { data: todo, error: insertError } = await serviceClient
        .from('todos')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          title: 'Todo to start',
          priority: 'medium',
          status: 'todo',
          created_by: userId,
        })
        .select()
        .single();

      expect(insertError).toBeNull();

      const { data: updated, error } = await serviceClient
        .from('todos')
        .update({ status: 'in-progress' })
        .eq('id', todo!.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updated!.status).toBe('in-progress');
    });
  });

  describe('Delete Todo', () => {
    it('should delete a todo', async () => {
      const { data: todo, error: insertError } = await serviceClient
        .from('todos')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          title: 'Todo to delete',
          description: 'This will be deleted',
          priority: 'low',
          status: 'todo',
          created_by: userId,
        })
        .select()
        .single();

      expect(insertError).toBeNull();

      const { error } = await serviceClient
        .from('todos')
        .delete()
        .eq('id', todo!.id);

      expect(error).toBeNull();

      const { data: deleted } = await serviceClient
        .from('todos')
        .select()
        .eq('id', todo!.id)
        .single();

      expect(deleted).toBeNull();
    });
  });
});
