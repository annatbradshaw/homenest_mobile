import {
  createTestClient,
  createServiceClient,
  signInTestUser,
  cleanupTestData,
  createTestProject,
  TEST_TENANT_ID,
} from '../utils/supabase-test-client';

describe('Documents API', () => {
  const client = createTestClient();
  const serviceClient = createServiceClient();
  let userId: string;
  let projectId: string;
  let stageId: string;

  beforeAll(async () => {
    const { user } = await signInTestUser(client);
    userId = user.id;

    const project = await createTestProject(serviceClient, userId, {
      name: 'Test Project for Documents',
    });
    projectId = project.id;

    // Create a stage for documents
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data: stage } = await serviceClient
      .from('stages')
      .insert({
        project_id: projectId,
        tenant_id: TEST_TENANT_ID,
        name: 'Document Test Stage',
        description: 'Stage for document tests',
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

  describe('Create Document', () => {
    it('should create a new document record', async () => {
      const { data: doc, error } = await serviceClient
        .from('documents')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          stage_ids: [stageId],
          name: 'Floor Plan',
          url: 'https://storage.example.com/projects/123/floor-plan.pdf',
          type: 'plan',
          size: '1024000',
          category: 'blueprints',
          uploaded_by: userId,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(doc).toBeDefined();
      expect(doc!.name).toBe('Floor Plan');
      expect(doc!.type).toBe('plan');
      expect(doc!.category).toBe('blueprints');
    });

    it('should create document with notes', async () => {
      const { data: doc, error } = await serviceClient
        .from('documents')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          stage_ids: [stageId],
          name: 'Building Permit',
          notes: 'City approved building permit for construction',
          url: 'https://storage.example.com/projects/123/permit.pdf',
          type: 'permit',
          size: '512000',
          category: 'permits',
          uploaded_by: userId,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(doc!.notes).toBe('City approved building permit for construction');
    });

    it('should create photo document', async () => {
      const { data: doc, error } = await serviceClient
        .from('documents')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          stage_ids: [stageId],
          name: 'Progress Photo',
          url: 'https://storage.example.com/projects/123/progress-week1.jpg',
          type: 'photo',
          size: '2048000',
          category: 'progress',
          uploaded_by: userId,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(doc!.type).toBe('photo');
      expect(doc!.category).toBe('progress');
    });

    it('should create document without stage (project-level)', async () => {
      const { data: doc, error } = await serviceClient
        .from('documents')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          name: 'Contract Agreement',
          url: 'https://storage.example.com/projects/123/contract.pdf',
          type: 'contract',
          size: '256000',
          category: 'contracts',
          uploaded_by: userId,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(doc!.stage_ids).toEqual([]);
      expect(doc!.type).toBe('contract');
    });

    it('should create document with tags', async () => {
      const { data: doc, error } = await serviceClient
        .from('documents')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          name: 'Tagged Document',
          url: 'https://storage.example.com/projects/123/tagged.pdf',
          type: 'other',
          size: '100000',
          category: 'misc',
          tags: ['important', 'review-needed'],
          uploaded_by: userId,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(doc!.tags).toContain('important');
      expect(doc!.tags).toContain('review-needed');
    });
  });

  describe('Read Documents', () => {
    it('should list documents for a project', async () => {
      const { data: docs, error } = await client
        .from('documents')
        .select('*')
        .eq('project_id', projectId);

      expect(error).toBeNull();
      expect(docs).toBeDefined();
      expect(docs!.length).toBeGreaterThan(0);
    });

    it('should filter documents by type', async () => {
      const { data: docs, error } = await client
        .from('documents')
        .select('*')
        .eq('project_id', projectId)
        .eq('type', 'plan');

      expect(error).toBeNull();
      expect(docs!.every(d => d.type === 'plan')).toBe(true);
    });

    it('should filter documents by category', async () => {
      const { data: docs, error } = await client
        .from('documents')
        .select('*')
        .eq('project_id', projectId)
        .eq('category', 'blueprints');

      expect(error).toBeNull();
      expect(docs!.every(d => d.category === 'blueprints')).toBe(true);
    });

    it('should get project-level documents (no stages)', async () => {
      const { data: docs, error } = await client
        .from('documents')
        .select('*')
        .eq('project_id', projectId)
        .eq('stage_ids', '{}');

      expect(error).toBeNull();
      expect(docs!.every(d => d.stage_ids.length === 0)).toBe(true);
    });
  });

  describe('Update Document', () => {
    it('should update document name and notes', async () => {
      const { data: doc, error: insertError } = await serviceClient
        .from('documents')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          name: 'Original Name',
          url: 'https://storage.example.com/projects/123/update-test.pdf',
          type: 'other',
          size: '100000',
          category: 'misc',
          uploaded_by: userId,
        })
        .select()
        .single();

      expect(insertError).toBeNull();

      const { data: updated, error } = await serviceClient
        .from('documents')
        .update({
          name: 'Updated Name',
          notes: 'Added notes',
        })
        .eq('id', doc!.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updated!.name).toBe('Updated Name');
      expect(updated!.notes).toBe('Added notes');
    });

    it('should update document category', async () => {
      const { data: doc, error: insertError } = await serviceClient
        .from('documents')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          name: 'Category Change Test',
          url: 'https://storage.example.com/projects/123/category-test.pdf',
          type: 'other',
          size: '100000',
          category: 'misc',
          uploaded_by: userId,
        })
        .select()
        .single();

      expect(insertError).toBeNull();

      const { data: updated, error } = await serviceClient
        .from('documents')
        .update({ category: 'contracts' })
        .eq('id', doc!.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updated!.category).toBe('contracts');
    });

    it('should assign document to stages', async () => {
      const { data: doc, error: insertError } = await serviceClient
        .from('documents')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          name: 'Stage Assignment Test',
          url: 'https://storage.example.com/projects/123/stage-assign.pdf',
          type: 'other',
          size: '100000',
          category: 'misc',
          uploaded_by: userId,
        })
        .select()
        .single();

      expect(insertError).toBeNull();

      const { data: updated, error } = await serviceClient
        .from('documents')
        .update({ stage_ids: [stageId] })
        .eq('id', doc!.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updated!.stage_ids).toContain(stageId);
    });

    it('should update document tags', async () => {
      const { data: doc, error: insertError } = await serviceClient
        .from('documents')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          name: 'Tags Update Test',
          url: 'https://storage.example.com/projects/123/tags-test.pdf',
          type: 'other',
          size: '100000',
          category: 'misc',
          tags: ['old-tag'],
          uploaded_by: userId,
        })
        .select()
        .single();

      expect(insertError).toBeNull();

      const { data: updated, error } = await serviceClient
        .from('documents')
        .update({ tags: ['new-tag', 'updated'] })
        .eq('id', doc!.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updated!.tags).toContain('new-tag');
      expect(updated!.tags).not.toContain('old-tag');
    });
  });

  describe('Delete Document', () => {
    it('should delete a document record', async () => {
      const { data: doc, error: insertError } = await serviceClient
        .from('documents')
        .insert({
          project_id: projectId,
          tenant_id: TEST_TENANT_ID,
          name: 'To Delete',
          url: 'https://storage.example.com/projects/123/to-delete.pdf',
          type: 'other',
          size: '100000',
          category: 'misc',
          uploaded_by: userId,
        })
        .select()
        .single();

      expect(insertError).toBeNull();

      const { error } = await serviceClient
        .from('documents')
        .delete()
        .eq('id', doc!.id);

      expect(error).toBeNull();

      const { data: deleted } = await serviceClient
        .from('documents')
        .select()
        .eq('id', doc!.id)
        .single();

      expect(deleted).toBeNull();
    });
  });

  describe('Document Statistics', () => {
    it('should count documents by type', async () => {
      const { data: docs, error } = await client
        .from('documents')
        .select('type')
        .eq('project_id', projectId);

      expect(error).toBeNull();

      const typeCounts = docs!.reduce((acc, doc) => {
        acc[doc.type] = (acc[doc.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      expect(Object.keys(typeCounts).length).toBeGreaterThan(0);
    });
  });
});
