import {
  createTestClient,
  createServiceClient,
  signInTestUser,
  cleanupTestData,
  createTestProject,
  TEST_TENANT_ID,
} from '../utils/supabase-test-client';

describe('Expenses API', () => {
  const client = createTestClient();
  const serviceClient = createServiceClient();
  let userId: string;
  let projectId: string;
  let stageId: string;
  let supplierId: string;

  beforeAll(async () => {
    const { user } = await signInTestUser(client);
    userId = user.id;

    const project = await createTestProject(serviceClient, userId, {
      name: 'Test Project for Expenses',
    });
    projectId = project.id;

    // Create a stage for expenses
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data: stage } = await serviceClient
      .from('stages')
      .insert({
        project_id: projectId,
        tenant_id: TEST_TENANT_ID,
        name: 'Foundation Stage',
        description: 'Foundation work for expense tests',
        category: 'structure',
        status: 'in-progress',
        planned_start_date: today,
        planned_end_date: futureDate,
        created_by: userId,
      })
      .select()
      .single();

    stageId = stage!.id;

    // Create a supplier for expenses
    const { data: supplier } = await serviceClient
      .from('suppliers')
      .insert({
        project_id: projectId,
        tenant_id: TEST_TENANT_ID,
        name: 'ABC Concrete',
        company: 'ABC Concrete Inc',
        specialty: 'Concrete Work',
        stage_ids: [stageId],
        created_by: userId,
      })
      .select()
      .single();

    supplierId = supplier!.id;
  });

  afterAll(async () => {
    await cleanupTestData(serviceClient);
    await client.auth.signOut();
  });

  describe('Create Expense', () => {
    it('should create a new expense', async () => {
      const expenseDate = new Date().toISOString().split('T')[0];

      const { data: expense, error } = await serviceClient
        .from('expenses')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          stage_id: stageId,
          description: 'Concrete delivery',
          category: 'materials',
          amount: 2500.00,
          date: expenseDate,
          status: 'pending',
          created_by: userId,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(expense).toBeDefined();
      expect(expense!.description).toBe('Concrete delivery');
      expect(expense!.amount).toBe(2500);
      expect(expense!.category).toBe('materials');
    });

    it('should create expense linked to supplier', async () => {
      const expenseDate = new Date().toISOString().split('T')[0];

      const { data: expense, error } = await serviceClient
        .from('expenses')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          stage_id: stageId,
          supplier_id: supplierId,
          description: 'Concrete pouring labor',
          category: 'labor',
          amount: 1500.00,
          date: expenseDate,
          status: 'pending',
          created_by: userId,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(expense!.supplier_id).toBe(supplierId);
    });

    it('should create expense with receipt URL', async () => {
      const expenseDate = new Date().toISOString().split('T')[0];

      const { data: expense, error } = await serviceClient
        .from('expenses')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          stage_id: stageId,
          description: 'Tool rental',
          category: 'equipment',
          amount: 350.00,
          date: expenseDate,
          status: 'paid',
          receipt_url: 'https://storage.example.com/receipts/123.pdf',
          created_by: userId,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(expense!.receipt_url).toBe('https://storage.example.com/receipts/123.pdf');
      expect(expense!.status).toBe('paid');
    });

    it('should create expense with payment method', async () => {
      const expenseDate = new Date().toISOString().split('T')[0];

      const { data: expense, error } = await serviceClient
        .from('expenses')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          stage_id: stageId,
          description: 'Hardware store purchase',
          category: 'materials',
          amount: 200.00,
          date: expenseDate,
          status: 'paid',
          payment_method: 'credit_card',
          created_by: userId,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(expense!.payment_method).toBe('credit_card');
    });
  });

  describe('Read Expenses', () => {
    it('should list expenses for a project', async () => {
      const { data: expenses, error } = await client
        .from('expenses')
        .select('*')
        .eq('project_id', projectId);

      expect(error).toBeNull();
      expect(expenses).toBeDefined();
      expect(expenses!.length).toBeGreaterThan(0);
    });

    it('should filter expenses by stage', async () => {
      const { data: expenses, error } = await client
        .from('expenses')
        .select('*')
        .eq('stage_id', stageId);

      expect(error).toBeNull();
      expect(expenses!.every(e => e.stage_id === stageId)).toBe(true);
    });

    it('should filter expenses by category', async () => {
      const { data: expenses, error } = await client
        .from('expenses')
        .select('*')
        .eq('project_id', projectId)
        .eq('category', 'materials');

      expect(error).toBeNull();
      expect(expenses!.every(e => e.category === 'materials')).toBe(true);
    });

    it('should fetch expense with supplier details', async () => {
      const { data: expenses, error } = await client
        .from('expenses')
        .select('*, supplier:suppliers(id, name, company)')
        .eq('project_id', projectId)
        .not('supplier_id', 'is', null);

      expect(error).toBeNull();
      expect(expenses!.length).toBeGreaterThan(0);
      expect(expenses![0].supplier).toBeDefined();
    });
  });

  describe('Update Expense', () => {
    it('should update expense status to paid', async () => {
      const expenseDate = new Date().toISOString().split('T')[0];

      const { data: expense, error: insertError } = await serviceClient
        .from('expenses')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          stage_id: stageId,
          description: 'Expense to update',
          category: 'materials',
          amount: 500.00,
          date: expenseDate,
          status: 'pending',
          created_by: userId,
        })
        .select()
        .single();

      expect(insertError).toBeNull();

      const { data: updated, error } = await serviceClient
        .from('expenses')
        .update({ status: 'paid' })
        .eq('id', expense!.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updated!.status).toBe('paid');
    });

    it('should update expense amount and description', async () => {
      const expenseDate = new Date().toISOString().split('T')[0];

      const { data: expense, error: insertError } = await serviceClient
        .from('expenses')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          stage_id: stageId,
          description: 'Original description',
          category: 'labor',
          amount: 1000.00,
          date: expenseDate,
          status: 'pending',
          created_by: userId,
        })
        .select()
        .single();

      expect(insertError).toBeNull();

      const { data: updated, error } = await serviceClient
        .from('expenses')
        .update({
          description: 'Updated description',
          amount: 1200.00,
        })
        .eq('id', expense!.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updated!.description).toBe('Updated description');
      expect(updated!.amount).toBe(1200);
    });
  });

  describe('Delete Expense', () => {
    it('should delete an expense', async () => {
      const expenseDate = new Date().toISOString().split('T')[0];

      const { data: expense, error: insertError } = await serviceClient
        .from('expenses')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          stage_id: stageId,
          description: 'Expense to delete',
          category: 'other',
          amount: 100.00,
          date: expenseDate,
          status: 'pending',
          created_by: userId,
        })
        .select()
        .single();

      expect(insertError).toBeNull();

      const { error } = await serviceClient
        .from('expenses')
        .delete()
        .eq('id', expense!.id);

      expect(error).toBeNull();

      const { data: deleted } = await serviceClient
        .from('expenses')
        .select()
        .eq('id', expense!.id)
        .single();

      expect(deleted).toBeNull();
    });
  });

  describe('Expense Aggregations', () => {
    it('should calculate total expenses for a stage', async () => {
      const { data: expenses, error } = await client
        .from('expenses')
        .select('amount')
        .eq('stage_id', stageId);

      expect(error).toBeNull();

      const total = expenses!.reduce((sum, e) => sum + Number(e.amount), 0);
      expect(total).toBeGreaterThan(0);
    });
  });
});
