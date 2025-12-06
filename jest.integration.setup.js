// Integration test setup
// Ensure local Supabase is running before tests

const { execSync } = require('child_process');

beforeAll(async () => {
  // Check if Supabase is running
  try {
    execSync('supabase status', { stdio: 'pipe' });
    console.log('✓ Supabase local is running');
  } catch (error) {
    console.error('✗ Supabase local is not running. Start it with: supabase start');
    process.exit(1);
  }
});

// Increase timeout for integration tests
jest.setTimeout(30000);
