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

## Running Tests

To run all E2E tests:

```bash
npm run test:e2e
```

To run tests with UI mode:

```bash
npm run test:e2e:ui
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

If you encounter the error `TypeError: Cannot redefine property: Symbol($$jest-matchers-object)`, this is due to a conflict between Vitest and Playwright's test libraries. The current configuration includes fixes for this issue.

Make sure you're running E2E tests with the provided npm scripts and not mixing them with Vitest tests in the same process. 