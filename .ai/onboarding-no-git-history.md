# Project Onboarding: AIPersonalPlanner

## Welcome

Welcome to the AIPersonalPlanner project! AIPersonalPlanner is a web application that leverages artificial intelligence to streamline the process of planning meetings and events. It analyzes user preferences, notes, and time availability to propose optimal meeting times. The repository name is `ai-planner`.

## Project Overview & Structure

The project is a web application built with Astro for static site generation and server-side rendering, and React for interactive UI components. TypeScript is used for type safety. Styling is done with Tailwind CSS and Shadcn/ui components. Supabase serves as the backend, providing database and authentication services. AI capabilities are integrated via Openrouter.ai.

The project follows a standard modern web application structure:

-   `./` (Root): Contains configuration files (`astro.config.mjs`, `package.json`, `tailwind.config.js`, `tsconfig.json`, `vitest.config.ts`), CI/CD setup (`.github/workflows`), E2E tests (`e2e/`), and the main source code directory (`src/`).
-   `./src`: Contains all the application source code.
    -   `src/components`: Reusable UI components (Astro and React).
        -   `src/components/auth`: Authentication-related components.
        -   `src/components/proposals`: Components for meeting proposals.
        -   `src/components/ui`: Shadcn/ui based components.
        -   `src/components/shared`: Common shared components.
    -   `src/db`: Supabase client and database-related types/schemas.
    -   `src/features`: Potentially for feature-sliced modules.
    -   `src/hooks`: Custom React hooks.
    -   `src/layouts`: Astro layout components for page structure.
    -   `src/lib`: Shared libraries, helper functions, and core services (e.g., AI service, Supabase interactions).
    -   `src/middleware`: Astro middleware for request handling.
    -   `src/pages`: Astro pages that define the application's routes.
        -   `src/pages/api`: Server-side API endpoints.
        -   `src/pages/auth`: Authentication-related pages.
    -   `src/styles`: Global stylesheets.
    -   `src/types.ts`: Shared TypeScript type definitions.
    -   `src/env.d.ts`: TypeScript definitions for environment variables.
-   `./e2e`: End-to-end tests written with Playwright.
-   `./public`: Static assets publicly accessible.
-   `./supabase`: Configuration and migration files for Supabase.

## Core Modules

### `src/pages` and `src/layouts` (Astro)
-   **Role:** Defines the overall page structure and routing of the application. Astro is used for server-rendered pages and acts as an orchestrator for React components.
-   **Key Files/Areas:** `src/pages/index.astro`, `src/pages/dashboard.astro`, `src/pages/proposals.astro`, `src/layouts/Layout.astro` (example). `src/pages/README.md` provides details on login pages and feature flags.
-   **Recent Focus:** General site structure and content serving.

### `src/components` (React & Astro)
-   **Role:** Provides interactive UI elements and feature-specific views.
-   **Key Files/Areas:**
    -   `src/components/auth/`: Components for login, registration (e.g., `LoginForm.tsx`, `RegisterForm.tsx` - inferred).
    -   `src/components/proposals/`: Components related to creating and viewing meeting proposals (e.g., `ProposalsPage.tsx` - inferred from `.ai/onboarding.md` context, supported by `proposals.astro`).
    -   `src/components/ui/`: Base UI elements from Shadcn/ui (e.g., `button.tsx`, `input.tsx` - standard Shadcn/ui structure).
-   **Recent Focus:** Development of UI for core features like authentication and meeting proposals.

### `src/pages/api` (Astro API Routes)
-   **Role:** Handles server-side logic, data processing, and communication with the backend (Supabase) and AI services.
-   **Key Files/Areas:** Likely endpoints for `meeting-proposals`, `auth`, etc. (e.g. `src/pages/api/meeting-proposals.ts` - inferred from `.ai/onboarding.md` context and E2E test names in `package.json`).
-   **Recent Focus:** Backend logic for core application features.

### `src/lib/services`
-   **Role:** Contains core business logic, interactions with Supabase, and AI service integrations.
-   **Key Files/Areas:** Likely `auth.service.ts`, `meeting-proposals.service.ts`, `openai.service.ts` (inferred).
-   **Recent Focus:** Implementing logic for AI-powered scheduling and user management.

### `e2e/` (Playwright)
-   **Role:** End-to-end testing to ensure application workflows function correctly.
-   **Key Files/Areas:** Test scripts for major features, e.g., `e2e/meeting-proposals-e2e-test.spec.ts` (name found in `package.json` scripts).
-   **Recent Focus:** Ensuring the reliability of core features like meeting proposals.

### `src/db` & Supabase Integration
-   **Role:** Manages database interactions, schema, and user authentication via Supabase.
-   **Key Files/Areas:** Supabase client setup, database type definitions.
-   **Recent Focus:** Data persistence and user authentication backend.

## Key Contributors

-   **Vadim Voyevoda:** Likely the primary maintainer and a key contributor, based on the GitHub repository ownership (`https://github.com/vadimvoyevoda/ai-planner.git`).
-   *(Detailed contributor list from git history was not retrieved via available tools.)*

## Overall Takeaways & Recent Focus

-   **Core Functionality:** The project is centered around AI-driven meeting scheduling, user authentication, and managing meeting preferences.
-   **Tech Stack:** Modern stack (Astro, React, TypeScript, Tailwind, Supabase) focused on performance and developer experience.
-   **Testing:** Emphasis on both unit/component testing (Vitest) and E2E testing (Playwright).
-   **Development Focus (Inferred):** Significant effort appears to be on the meeting proposal feature (given specific E2E tests) and establishing a solid authentication system.
-   **Documentation:** A good `README.md` exists for setup and overview. `src/pages/README.md` details page-specific logic like feature flags. A `CONTRIBUTING.md` was not found.

## Potential Complexity/Areas to Note

-   **AI Service Integration:** Managing prompts, parsing responses, and handling errors from Openrouter.ai / OpenAI services.
-   **Astro/React Interoperability:** State management and data flow between Astro pages and React components.
-   **E2E Test Maintenance:** Keeping Playwright tests stable and up-to-date, especially for complex UI flows.
-   **Supabase Integration:** Understanding Supabase features (Auth, Postgres, Edge Functions if used) in depth.
-   **Feature Flag Management:** The system described in `src/pages/README.md` (using `auth` and `dev_tools` flags) needs careful handling during development and deployment.
-   **TypeScript:** Ensuring robust typing across the application, especially for shared types in `src/types.ts`.

## Questions for the Team

1.  What is the current strategy for managing and versioning prompts for the AI models (via Openrouter.ai)?
2.  Can you describe the end-to-end data flow for creating a meeting proposal, from UI interaction to AI processing and back?
3.  Are there established patterns for state management within React components, especially for complex forms or shared state across different islands?
4.  What is the process for managing environment variables and feature flags (`auth`, `dev_tools`) across different environments (local, staging, production)?
5.  How are database migrations for Supabase typically handled and coordinated within the team?
6.  Are there any specific guidelines or best practices for writing E2E tests with Playwright in this project?
7.  What are the plans for expanding Google Calendar integration (currently one-way export)?

## Next Steps

1.  **Set up the development environment:** Follow the instructions in `README.md` (clone, `nvm use`, `npm install`).
2.  **Run the application:** Use `npm run dev` and explore the UI, focusing on login/registration and any available meeting proposal features. The application should be available at `http://localhost:3000` (as per `package.json`, `README.md` mentions 4321 but `package.json` seems more current for the dev script).
3.  **Execute tests:** Run unit tests (`npm test`) and E2E tests (`npm run test:e2e:all`) to see them in action and understand test coverage.
4.  **Deep Dive into Core Features:**
    *   Review code for authentication: `src/pages/auth/`, `src/components/auth/`, and related API routes/services.
    *   Review code for meeting proposals: `src/pages/proposals.astro`, `src/components/proposals/`, and related API routes/services.
5.  **Review Feature Flag Logic:** Understand how the `auth` and `dev_tools` flags (detailed in `src/pages/README.md`) affect the application flow.

## Development Environment Setup

### Prerequisites
-   Node.js **v22.14.0** (use [nvm](https://github.com/nvm-sh/nvm) to manage Node versions: `nvm use`)
-   `npm` or `yarn` package manager

### Installation & Setup
1.  Clone the repository:
    ```bash
    git clone https://github.com/vadimvoyevoda/ai-planner.git
    cd ai-planner
    ```
2.  Use the correct Node.js version:
    ```bash
    nvm use 
    ```
    (This will use the version specified in `.nvmrc`)
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
    The application will likely be available at `http://localhost:3000`. (`README.md` mentions port 4321, but the `dev` script in `package.json` specifies port 3000.)

### Available Scripts (from `package.json`):
-   `npm run dev`: Start the development server (Astro).
-   `npm run build`: Build the project for production.
-   `npm run preview`: Preview the production build locally.
-   `npm run lint`: Run ESLint to check for code issues.
-   `npm run format`: Format code using Prettier.
-   `npm test`: Run unit tests with Vitest.
-   `npm run test:e2e:all`: Run all Playwright E2E tests.
-   `npm run test:e2e`: Run a specific E2E test file (`e2e/meeting-proposals-e2e-test.spec.ts`).

## Helpful Resources

-   **Project Repository:** [https://github.com/vadimvoyevoda/ai-planner.git](https://github.com/vadimvoyevoda/ai-planner.git)
-   **Node Version Manager (nvm):** [https://github.com/nvm-sh/nvm](https://github.com/nvm-sh/nvm)
-   **Astro Documentation:** [https://astro.build/](https://astro.build/)
-   **React Documentation:** [https://react.dev/](https://react.dev/)
-   **Tailwind CSS Documentation:** [https://tailwindcss.com/](https://tailwindcss.com/)
-   **Shadcn/ui:** [https://ui.shadcn.com/](https://ui.shadcn.com/)
-   **Supabase Documentation:** [https://supabase.com/docs](https://supabase.com/docs)
-   **Playwright Documentation:** [https://playwright.dev/docs/intro](https://playwright.dev/docs/intro)
-   **Vitest Documentation:** [https://vitest.dev/](https://vitest.dev/)
-   **Openrouter.ai:** (AI model provider, refer to their official website for docs)
-   **Internal Documentation:**
    -   `README.md` (Project root)
    -   `src/pages/README.md` (Details on page structure and feature flags)
-   **Issue Tracker:** Likely GitHub Issues on the project repository.
-   **Communication:** Contact the repository maintainer (Vadim Voyevoda) via GitHub. (Specific communication channels like Slack/Discord were not found in the explored files).
-   **`CONTRIBUTING.md`:** Not found during exploration. 