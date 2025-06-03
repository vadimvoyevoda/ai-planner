# Authentication Pages with Feature Flags

This directory contains authentication-related pages that are now integrated with the feature flag system. All pages check for the `auth` feature flag and automatically redirect to homepage with a default user when the feature is disabled.

## Pages with Feature Flag Integration

- `login.astro` - Login page
- `register.astro` - Registration page
- `reset-password.astro` - Password reset request page
- `new-password.astro` - New password setup page

## How Feature Flags Are Implemented

Each page includes the following code at the top of its frontmatter section:

```astro
import { isFeatureEnabled } from "@/features/featureFlags";

// Sprawdzenie flagi dla funkcjonalności auth
const authEnabled = isFeatureEnabled("auth");

// Gdy funkcjonalność jest wyłączona, przekieruj na stronę główną
// System automatycznie użyje domyślnego użytkownika
if (!authEnabled) {
  console.log("[Auth] Auth wyłączone, przekierowuję na stronę główną z domyślnym użytkownikiem");
  return Astro.redirect("/");
}
```

This ensures that when the auth feature is disabled:
1. Users are automatically redirected to the homepage
2. A default user is automatically used instead of requiring authentication
3. All application features work normally with the default user

## Default User System

When the `auth` flag is set to `false`:

1. All authentication pages (`/auth/*`) automatically redirect to the homepage
2. The Layout component uses a default user with predefined credentials
3. Users can use the application without having to log in
4. A "Default User" badge is displayed in the header to indicate this mode

This behavior is particularly useful for:
- Development and testing environments
- Demonstration purposes
- Situations where authentication is not required

## Default Feature Flag Values

The current feature flag values in the application:

```typescript
// From src/features/featureFlags.ts
const defaultFlags: Record<Environment, Record<FeatureFlagName, boolean>> = {
  local: {
    auth: false,
    collections: true,
    dev_tools: true,
  },
  integration: {
    auth: true,
    collections: true,
    dev_tools: false,
  },
  prod: {
    auth: true,
    collections: true,
    dev_tools: false,
  },
};
```

## Available Feature Flags

| Flag | Description | Default Value (local) | Default Value (integration/prod) |
|------|-------------|----------------------|--------------------------------|
| auth | Controls access to authentication features | false | true |
| collections | Controls access to collection/proposal features | true | true |
| dev_tools | Controls access to developer tools | true | false |

## Managing Feature Flags

To enable or disable features:

1. Set the environment variable `FF_[FLAG_NAME]` (e.g., `FF_AUTH=true`)
2. Update the feature flag through the API
3. Modify the default configuration in the code 