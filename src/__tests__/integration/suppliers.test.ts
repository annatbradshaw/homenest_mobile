import {
  createTestClient,
  createServiceClient,
  signInTestUser,
  cleanupTestData,
  createTestProject,
  TEST_TENANT_ID,
} from '../utils/supabase-test-client';

describe('Suppliers API', () => {
  const client = createTestClient();
  const serviceClient = createServiceClient();
  let userId: string;
  let projectId: string;
  let stageId1: string;
  let stageId2: string;

  beforeAll(async () => {
    const { user } = await signInTestUser(client);
    userId = user.id;

    const project = await createTestProject(serviceClient, userId, {
      name: 'Test Project for Suppliers',
    });
    projectId = project.id;

    // Create stages to assign to suppliers
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data: stage1 } = await serviceClient
      .from('stages')
      .insert({
        project_id: projectId,
        tenant_id: TEST_TENANT_ID,
        name: 'Electrical Stage',
        description: 'Electrical work',
        category: 'utilities',
        status: 'not-started',
        planned_start_date: today,
        planned_end_date: futureDate,
        created_by: userId,
      })
      .select()
      .single();

    stageId1 = stage1!.id;

    const { data: stage2 } = await serviceClient
      .from('stages')
      .insert({
        project_id: projectId,
        tenant_id: TEST_TENANT_ID,
        name: 'Plumbing Stage',
        description: 'Plumbing work',
        category: 'utilities',
        status: 'not-started',
        planned_start_date: today,
        planned_end_date: futureDate,
        created_by: userId,
      })
      .select()
      .single();

    stageId2 = stage2!.id;
  });

  afterAll(async () => {
    await cleanupTestData(serviceClient);
    await client.auth.signOut();
  });

  describe('Create Supplier', () => {
    it('should create a new supplier', async () => {
      const { data: supplier, error } = await serviceClient
        .from('suppliers')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          name: 'John Smith',
          company: 'Smith Electric LLC',
          phone: '555-123-4567',
          email: 'john@smithelectric.com',
          specialty: 'Electrical',
          created_by: userId,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(supplier).toBeDefined();
      expect(supplier!.name).toBe('John Smith');
      expect(supplier!.company).toBe('Smith Electric LLC');
      expect(supplier!.specialty).toBe('Electrical');
    });

    it('should create supplier with stage assignments', async () => {
      const { data: supplier, error } = await serviceClient
        .from('suppliers')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          name: 'Mike Johnson',
          company: 'Johnson Plumbing',
          specialty: 'Plumbing',
          stage_ids: [stageId1, stageId2],
          created_by: userId,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(supplier!.stage_ids).toContain(stageId1);
      expect(supplier!.stage_ids).toContain(stageId2);
    });

    it('should create supplier with contract details', async () => {
      const { data: supplier, error } = await serviceClient
        .from('suppliers')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          name: 'Sarah Williams',
          company: 'Williams Construction',
          specialty: 'General Contracting',
          contract_value: 25000.00,
          payment_terms: 'Net 30',
          rating: 5,
          notes: 'Excellent work quality',
          created_by: userId,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(supplier!.contract_value).toBe(25000);
      expect(supplier!.payment_terms).toBe('Net 30');
      expect(supplier!.rating).toBe(5);
      expect(supplier!.notes).toBe('Excellent work quality');
    });
  });

  describe('Read Suppliers', () => {
    it('should list suppliers for a project', async () => {
      const { data: suppliers, error } = await client
        .from('suppliers')
        .select('*')
        .eq('project_id', projectId);

      expect(error).toBeNull();
      expect(suppliers).toBeDefined();
      expect(suppliers!.length).toBeGreaterThan(0);
    });

    it('should filter suppliers by specialty', async () => {
      const { data: suppliers, error } = await client
        .from('suppliers')
        .select('*')
        .eq('project_id', projectId)
        .eq('specialty', 'Electrical');

      expect(error).toBeNull();
      expect(suppliers!.every(s => s.specialty === 'Electrical')).toBe(true);
    });

    it('should filter active suppliers', async () => {
      // Create an active supplier
      await serviceClient.from('suppliers').insert({
        project_id: projectId,
        tenant_id: TEST_TENANT_ID,
        name: 'Active Supplier',
        company: 'Active Co',
        is_active: true,
        created_by: userId,
      });

      const { data: suppliers, error } = await client
        .from('suppliers')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_active', true);

      expect(error).toBeNull();
      expect(suppliers!.every(s => s.is_active === true)).toBe(true);
    });
  });

  describe('Update Supplier', () => {
    it('should update supplier contact info', async () => {
      const { data: supplier } = await serviceClient
        .from('suppliers')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          name: 'Original Name',
          company: 'Original Company',
          email: 'old@email.com',
          created_by: userId,
        })
        .select()
        .single();

      const { data: updated, error } = await serviceClient
        .from('suppliers')
        .update({
          name: 'Updated Name',
          email: 'new@email.com',
          phone: '555-999-8888',
        })
        .eq('id', supplier!.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updated!.name).toBe('Updated Name');
      expect(updated!.email).toBe('new@email.com');
      expect(updated!.phone).toBe('555-999-8888');
    });

    it('should update supplier stage assignments', async () => {
      const { data: supplier } = await serviceClient
        .from('suppliers')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          name: 'Stage Assignment Test',
          company: 'Test Co',
          stage_ids: [stageId1],
          created_by: userId,
        })
        .select()
        .single();

      // Update to include both stages
      const { data: updated, error } = await serviceClient
        .from('suppliers')
        .update({
          stage_ids: [stageId1, stageId2],
        })
        .eq('id', supplier!.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updated!.stage_ids).toHaveLength(2);
      expect(updated!.stage_ids).toContain(stageId1);
      expect(updated!.stage_ids).toContain(stageId2);
    });

    it('should update supplier rating', async () => {
      const { data: supplier } = await serviceClient
        .from('suppliers')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          name: 'Rating Test Supplier',
          company: 'Rating Co',
          rating: 3,
          created_by: userId,
        })
        .select()
        .single();

      const { data: updated, error } = await serviceClient
        .from('suppliers')
        .update({ rating: 5 })
        .eq('id', supplier!.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updated!.rating).toBe(5);
    });

    it('should deactivate a supplier', async () => {
      const { data: supplier } = await serviceClient
        .from('suppliers')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          name: 'To Deactivate',
          company: 'Deactivate Co',
          is_active: true,
          created_by: userId,
        })
        .select()
        .single();

      const { data: updated, error } = await serviceClient
        .from('suppliers')
        .update({ is_active: false })
        .eq('id', supplier!.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updated!.is_active).toBe(false);
    });
  });

  describe('Delete Supplier', () => {
    it('should delete a supplier', async () => {
      const { data: supplier } = await serviceClient
        .from('suppliers')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          name: 'To Delete',
          company: 'Delete Co',
          created_by: userId,
        })
        .select()
        .single();

      const { error } = await serviceClient
        .from('suppliers')
        .delete()
        .eq('id', supplier!.id);

      expect(error).toBeNull();

      const { data: deleted } = await serviceClient
        .from('suppliers')
        .select()
        .eq('id', supplier!.id)
        .single();

      expect(deleted).toBeNull();
    });
  });

  describe('Supplier with Expenses', () => {
    it('should list expenses for a supplier', async () => {
      // Create a supplier
      const { data: supplier } = await serviceClient
        .from('suppliers')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          name: 'Supplier With Expenses',
          company: 'Expense Test Co',
          stage_ids: [stageId1],
          created_by: userId,
        })
        .select()
        .single();

      // Create expenses linked to supplier
      const expenseDate = new Date().toISOString().split('T')[0];
      await serviceClient.from('expenses').insert([
        {
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          stage_id: stageId1,
          supplier_id: supplier!.id,
          description: 'Labor cost',
          category: 'labor',
          amount: 1000.00,
          date: expenseDate,
          status: 'pending',
          created_by: userId,
        },
        {
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          stage_id: stageId1,
          supplier_id: supplier!.id,
          description: 'Materials cost',
          category: 'materials',
          amount: 500.00,
          date: expenseDate,
          status: 'paid',
          created_by: userId,
        },
      ]);

      // Query expenses for this supplier (use service client to bypass RLS)
      const { data: expenses, error } = await serviceClient
        .from('expenses')
        .select('*')
        .eq('supplier_id', supplier!.id);

      expect(error).toBeNull();
      expect(expenses).toHaveLength(2);

      const total = expenses!.reduce((sum, e) => sum + Number(e.amount), 0);
      expect(total).toBe(1500);
    });
  });
});
