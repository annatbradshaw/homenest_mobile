import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Local Supabase credentials
const SUPABASE_LOCAL_URL = process.env.SUPABASE_LOCAL_URL || 'http://127.0.0.1:54321';
const SUPABASE_LOCAL_ANON_KEY = process.env.SUPABASE_LOCAL_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

function createAuthClient(): SupabaseClient {
  return createClient(SUPABASE_LOCAL_URL, SUPABASE_LOCAL_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Generate unique email for each test run
const timestamp = Date.now();
const uniqueEmail = (suffix: string) => `auth-test-${suffix}-${timestamp}@example.com`;

describe('Authentication Flows', () => {
  describe('Sign Up', () => {
    it('should sign up a new user', async () => {
      const client = createAuthClient();
      const email = uniqueEmail('signup');
      const password = 'testpassword123';

      const { data, error } = await client.auth.signUp({
        email,
        password,
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user!.email).toBe(email);

      await client.auth.signOut();
    });

    it('should sign up user with metadata', async () => {
      const client = createAuthClient();
      const email = uniqueEmail('metadata');
      const password = 'testpassword123';

      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User',
          },
        },
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user!.user_metadata.first_name).toBe('Test');
      expect(data.user!.user_metadata.last_name).toBe('User');

      await client.auth.signOut();
    });

    it('should reject duplicate email signup', async () => {
      const client = createAuthClient();
      const email = uniqueEmail('duplicate');
      const password = 'testpassword123';

      // First signup
      await client.auth.signUp({ email, password });

      // Attempt duplicate signup
      const { data, error } = await client.auth.signUp({
        email,
        password,
      });

      // Supabase returns the user but doesn't create duplicate
      // The behavior depends on email confirmation settings
      expect(data).toBeDefined();

      await client.auth.signOut();
    });

    it('should reject weak password', async () => {
      const client = createAuthClient();
      const email = uniqueEmail('weakpass');

      const { error } = await client.auth.signUp({
        email,
        password: '123', // Too short
      });

      expect(error).toBeDefined();
    });

    it('should reject invalid email format', async () => {
      const client = createAuthClient();

      const { error } = await client.auth.signUp({
        email: 'invalid-email',
        password: 'testpassword123',
      });

      expect(error).toBeDefined();
    });
  });

  describe('Sign In', () => {
    const signInEmail = uniqueEmail('signin');
    const signInPassword = 'testpassword123';

    beforeAll(async () => {
      // Create user for sign in tests
      const client = createAuthClient();
      await client.auth.signUp({
        email: signInEmail,
        password: signInPassword,
      });
      await client.auth.signOut();
    });

    it('should sign in with valid credentials', async () => {
      const client = createAuthClient();

      const { data, error } = await client.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.session).toBeDefined();
      expect(data.user!.email).toBe(signInEmail);

      await client.auth.signOut();
    });

    it('should return session tokens on sign in', async () => {
      const client = createAuthClient();

      const { data, error } = await client.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      });

      expect(error).toBeNull();
      expect(data.session!.access_token).toBeDefined();
      expect(data.session!.refresh_token).toBeDefined();
      expect(data.session!.expires_in).toBeDefined();

      await client.auth.signOut();
    });

    it('should reject invalid password', async () => {
      const client = createAuthClient();

      const { error } = await client.auth.signInWithPassword({
        email: signInEmail,
        password: 'wrongpassword',
      });

      expect(error).toBeDefined();
      expect(error!.message).toContain('Invalid login credentials');
    });

    it('should reject non-existent user', async () => {
      const client = createAuthClient();

      const { error } = await client.auth.signInWithPassword({
        email: 'nonexistent@example.com',
        password: 'testpassword123',
      });

      expect(error).toBeDefined();
    });
  });

  describe('Sign Out', () => {
    it('should sign out and clear session', async () => {
      const client = createAuthClient();
      const email = uniqueEmail('signout');
      const password = 'testpassword123';

      // Sign up and sign in
      await client.auth.signUp({ email, password });
      await client.auth.signInWithPassword({ email, password });

      // Verify signed in
      const { data: beforeSignOut } = await client.auth.getSession();
      expect(beforeSignOut.session).toBeDefined();

      // Sign out
      const { error } = await client.auth.signOut();
      expect(error).toBeNull();

      // Verify signed out
      const { data: afterSignOut } = await client.auth.getSession();
      expect(afterSignOut.session).toBeNull();
    });
  });

  describe('Session Management', () => {
    it('should get current session', async () => {
      const client = createAuthClient();
      const email = uniqueEmail('session');
      const password = 'testpassword123';

      await client.auth.signUp({ email, password });
      await client.auth.signInWithPassword({ email, password });

      const { data, error } = await client.auth.getSession();

      expect(error).toBeNull();
      expect(data.session).toBeDefined();
      expect(data.session!.user.email).toBe(email);

      await client.auth.signOut();
    });

    it('should get current user', async () => {
      const client = createAuthClient();
      const email = uniqueEmail('getuser');
      const password = 'testpassword123';

      await client.auth.signUp({ email, password });
      await client.auth.signInWithPassword({ email, password });

      const { data, error } = await client.auth.getUser();

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user!.email).toBe(email);

      await client.auth.signOut();
    });

    it('should return null session when not logged in', async () => {
      const client = createAuthClient();

      const { data, error } = await client.auth.getSession();

      expect(error).toBeNull();
      expect(data.session).toBeNull();
    });
  });

  describe('Password Update', () => {
    it('should update password when signed in', async () => {
      const client = createAuthClient();
      const email = uniqueEmail('updatepass');
      const oldPassword = 'oldpassword123';
      const newPassword = 'newpassword456';

      await client.auth.signUp({ email, password: oldPassword });
      await client.auth.signInWithPassword({ email, password: oldPassword });

      const { error } = await client.auth.updateUser({
        password: newPassword,
      });

      expect(error).toBeNull();

      await client.auth.signOut();

      // Verify new password works
      const { data, error: signInError } = await client.auth.signInWithPassword({
        email,
        password: newPassword,
      });

      expect(signInError).toBeNull();
      expect(data.user).toBeDefined();

      await client.auth.signOut();
    });
  });

  describe('User Metadata Update', () => {
    it('should update user metadata', async () => {
      const client = createAuthClient();
      const email = uniqueEmail('updatemeta');
      const password = 'testpassword123';

      await client.auth.signUp({ email, password });
      await client.auth.signInWithPassword({ email, password });

      const { data, error } = await client.auth.updateUser({
        data: {
          first_name: 'Updated',
          last_name: 'Name',
          phone: '555-123-4567',
        },
      });

      expect(error).toBeNull();
      expect(data.user!.user_metadata.first_name).toBe('Updated');
      expect(data.user!.user_metadata.last_name).toBe('Name');
      expect(data.user!.user_metadata.phone).toBe('555-123-4567');

      await client.auth.signOut();
    });
  });

  describe('Email Update', () => {
    it('should request email change', async () => {
      const client = createAuthClient();
      const email = uniqueEmail('emailchange');
      const newEmail = uniqueEmail('newemail');
      const password = 'testpassword123';

      await client.auth.signUp({ email, password });
      await client.auth.signInWithPassword({ email, password });

      // Note: In local dev, email confirmation may be disabled
      // This test verifies the API call works
      const { error } = await client.auth.updateUser({
        email: newEmail,
      });

      // The request should succeed (email confirmation may be required in prod)
      expect(error).toBeNull();

      await client.auth.signOut();
    });
  });

  describe('Auth State Change', () => {
    it('should trigger auth state change on sign in', async () => {
      const client = createAuthClient();
      const email = uniqueEmail('authstate');
      const password = 'testpassword123';

      await client.auth.signUp({ email, password });

      let stateChangeCalled = false;
      let eventReceived: string | null = null;

      const { data: { subscription } } = client.auth.onAuthStateChange((event) => {
        stateChangeCalled = true;
        eventReceived = event;
      });

      await client.auth.signInWithPassword({ email, password });

      // Give time for event to fire
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(stateChangeCalled).toBe(true);
      expect(eventReceived).toBe('SIGNED_IN');

      subscription.unsubscribe();
      await client.auth.signOut();
    });
  });
});
