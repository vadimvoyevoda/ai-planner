# E2E Testing with Playwright

This directory contains end-to-end tests for the application using Playwright.

## Setup

1. Create a `.env.test` file in the root directory with the following variables:

```
# Supabase configuration
SUPABASE_URL=your_supabase_url
SUPABASE_PUBLIC_KEY=your_supabase_public_key

# E2E Test user credentials
E2E_USERNAME=test@example.com
E2E_PASSWORD=password123
E2E_USERNAME_ID=your_test_user_id

# Test mode
ASTRO_MODE=test
```

Replace the placeholder values with your actual Supabase credentials and test user information.

2. Install dependencies:

```bash
npm install
```

## Running E2E Tests

There are several ways to run E2E tests:

1. **Running a specific test file** (recommended):
   ```bash
   npm run test:e2e:specific
   ```
   This runs the main meeting proposal test, which is the most stable approach.

2. **Running all E2E tests** (may have conflicts with Vitest):
   ```bash
   npm run test:e2e
   ```

3. **Running with UI mode** (for debugging):
   ```bash
   npm run test:e2e:ui
   ```

4. **Running a custom test file**:
   ```bash
   npm run test:e2e:file -- e2e/your-test-file.spec.ts
   ```

## Authentication

The tests use Supabase API authentication instead of UI-based login for improved reliability and performance. The authentication process is handled in the following files:

- `setup-global.ts` - Global setup that authenticates the user and saves the authentication state
- `setup-auth.ts` - Authentication setup that can be used as a dependency for test projects
- `auth.setup.ts` - Legacy UI-based authentication (kept for reference)

## Test Structure

- Page objects are in the `page-objects` directory
- Test files have a `.spec.ts` extension
- Each test file should test a specific feature or user flow

## Database Cleanup

After tests, the database is cleaned up by deleting test data. This is configured in `global.teardown.ts` and only affects records created by the test user (identified by `E2E_USERNAME_ID`).

## Troubleshooting

### Vitest and Playwright Conflict

If you encounter errors like:
```
TypeError: Cannot redefine property: Symbol($$jest-matchers-object)
```

This is due to a conflict between Vitest and Playwright's test libraries. To resolve this:

1. Always run specific test files directly instead of the entire test suite
2. Use the `test:e2e:specific` script which is configured to avoid these conflicts
3. If you need to run a different test file, use:
   ```bash
   npm run test:e2e:file -- path/to/your/test/file.spec.ts
   ``` 