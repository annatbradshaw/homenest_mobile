import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Local Supabase credentials (from supabase start output)
const SUPABASE_LOCAL_URL = process.env.SUPABASE_LOCAL_URL || 'http://127.0.0.1:54321';
const SUPABASE_LOCAL_ANON_KEY = process.env.SUPABASE_LOCAL_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const SUPABASE_LOCAL_SERVICE_KEY = process.env.SUPABASE_LOCAL_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Test tenant and user IDs
export const TEST_TENANT_ID = '11111111-1111-1111-1111-111111111111';
export const TEST_USER_EMAIL = 'test@example.com';
export const TEST_USER_PASSWORD = 'testpassword123';

/**
 * Create a Supabase client for testing with anon key
 */
export function createTestClient(): SupabaseClient {
  return createClient(SUPABASE_LOCAL_URL, SUPABASE_LOCAL_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Create a Supabase client with service role for admin operations
 */
export function createServiceClient(): SupabaseClient {
  return createClient(SUPABASE_LOCAL_URL, SUPABASE_LOCAL_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Sign up and sign in a test user
 */
export async function signInTestUser(client: SupabaseClient): Promise<{ user: any; session: any }> {
  // Try to sign in first
  const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
  });

  if (signInData?.user) {
    return { user: signInData.user, session: signInData.session };
  }

  // If sign in fails, create the user
  const { data: signUpData, error: signUpError } = await client.auth.signUp({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
  });

  if (signUpError) {
    throw signUpError;
  }

  // Sign in after signup
  const { data: finalData, error: finalError } = await client.auth.signInWithPassword({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
  });

  if (finalError) {
    throw finalError;
  }

  return { user: finalData.user, session: finalData.session };
}

/**
 * Clean up test data (use service client)
 */
export async function cleanupTestData(serviceClient: SupabaseClient) {
  // Delete in order of dependencies (most dependent first)
  await serviceClient.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await serviceClient.from('push_tokens').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await serviceClient.from('project_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await serviceClient.from('documents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await serviceClient.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await serviceClient.from('todos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await serviceClient.from('suppliers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await serviceClient.from('stages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await serviceClient.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await serviceClient.from('tenant_memberships').delete().neq('tenant_id', '00000000-0000-0000-0000-000000000000');
}

/**
 * Create test project with tenant membership
 */
export async function createTestProject(
  serviceClient: SupabaseClient,
  userId: string,
  projectData: { name: string; description?: string }
) {
  // Ensure user profile exists
  await serviceClient.from('user_profiles').upsert({
    id: userId,
    first_name: 'Test',
    last_name: 'User',
  }, { onConflict: 'id' });

  // Ensure tenant membership exists
  await serviceClient.from('tenant_memberships').upsert({
    tenant_id: TEST_TENANT_ID,
    user_id: userId,
    role: 'owner',
    is_active: true,
  }, { onConflict: 'tenant_id,user_id' });

  // Create project with required fields
  const { data, error } = await serviceClient
    .from('projects')
    .insert({
      tenant_id: TEST_TENANT_ID,
      name: projectData.name,
      description: projectData.description,
      address: '123 Test Street',
      start_date: new Date().toISOString(),
      target_completion_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      total_budget: 50000,
      created_by: userId,
      status: 'planning',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
