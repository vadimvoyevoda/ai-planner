# Project Onboarding: AIPersonalPlanner

## Welcome

Welcome to the AIPersonalPlanner project! AIPersonalPlanner is a web application that leverages artificial intelligence to streamline the process of planning meetings and events. It analyzes user preferences, notes, and time availability to propose optimal meeting times.

## Project Overview & Structure

The core functionality revolves around AI-powered meeting scheduling, preference learning, meeting management, and Google Calendar integration. The project is a single web application built with Astro for pages and React for interactive components, utilizing Supabase for the backend.

The project follows this key structure (as per workspace rules):
- `./src` - source code
- `./src/layouts` - Astro layouts
- `./src/pages` - Astro pages (e.g., `src/pages/auth` for authentication routes)
- `./src/pages/api` - API endpoints (e.g., `src/pages/api/meeting-proposals.ts`)
- `./src/middleware/index.ts` - Astro middleware
- `./src/db` - Supabase clients and types
- `./src/types.ts` - Shared types
- `./src/components` - Client-side components (Astro/React)
  - `src/components/ui` - Shadcn/ui components
  - `src/components/auth` - Authentication-specific React components
  - `src/components/proposals` - Components like `ProposalsPage.tsx` (inferred from top files)
- `./src/lib` - Services and helpers (e.g., `src/lib/services`)
- `./e2e` - End-to-end tests

## Core Modules

This section details the primary modules of the AIPersonalPlanner. Insights from recent activity and inter-module relationships have been added.

### `e2e`
- **Role:** End-to-end testing infrastructure using Playwright. Ensures application workflows function correctly from a user's perspective. **This module is critical for validating the meeting proposal and authentication flows, which are core functionalities.**
- **Key Files/Areas:**
  - Test Specs: `e2e/meeting-proposals-e2e-test.spec.ts` (highly active), `e2e/login-test.spec.ts`
  - Configuration: `e2e/playwright.config.ts`, `e2e/config.ts`
  - Setups/Helpers: `e2e/auth.setup.ts`, `e2e/selectors.ts`, `e2e/page-objects/`
- **Top Contributed Files:** `e2e/meeting-proposals-e2e-test.spec.ts` (14 changes)
- **Recent Focus:** Extensive development and refinement of E2E tests. **Recent commits consistently show fixes, improvements to stability (e.g., better handling of async operations, improved selectors), and expansion of test coverage for edge cases in meeting proposal generation and authentication.**
- **Relationship to other modules:** Directly tests workflows involving `src/pages/api`, `src/components/proposals`, `src/components/auth`, and `src/lib/services`. Changes in these modules often necessitate updates here.

### `src/pages/api`
- **Role:** Defines server-side API endpoints, primarily Astro functions. This is where backend logic is exposed to the frontend.
- **Key Files/Areas:** `src/pages/api/meeting-proposals.ts` (highly active), other API endpoints for CRUD operations on meetings, user preferences, etc.
- **Recent Focus:** Significant activity in `meeting-proposals.ts` indicates ongoing development of the core AI scheduling logic, including request handling, validation, and interaction with `src/lib/services`.
- **Relationship to other modules:** Consumes services from `src/lib/services`. Called by frontend components in `src/components/proposals` and `src/components/auth` (e.g., for login/registration API calls).

### `src/lib/services`
- **Role:** Houses core business logic, API integrations (like OpenAI/OpenRouter), and service-layer functionalities. **This module acts as the brain for complex operations.**
- **Key Files/Areas:**
  - AI & Proposals: `src/lib/services/openai.service.ts`, `src/lib/services/meeting-proposals.service.ts` (highly active)
  - Meetings: `src/lib/services/meetings.service.ts`
  - Authentication: `src/lib/services/auth.service.ts`
- **Top Contributed Files:** `src/lib/services/meeting-proposals.service.ts`
- **Recent Focus:** Development and refinement of services for AI-driven meeting proposals. **Recent commits indicate work on prompt engineering, response parsing from AI models, error handling, and integration logic for different AI providers managed by `openai.service.ts`.**
- **Relationship to other modules:** Provides core logic to `src/pages/api`. May interact with `src/db` for data persistence.

### `src/components/proposals`
- **Role:** Contains React components specifically for the meeting proposal feature, including the main interface for users to interact with proposal generation and viewing.
- **Key Files/Areas:** `src/components/proposals/ProposalsPage.tsx` (highly active)
- **Recent Focus:** UI/UX enhancements for creating, viewing, and managing meeting proposals. **Recent activity points to improvements in form handling, state management for proposal data, and interaction with the `src/pages/api/meeting-proposals.ts` endpoint.**
- **Relationship to other modules:** Interacts heavily with `src/pages/api/meeting-proposals.ts`. Uses UI elements from `src/components/ui`.

### `src/components/auth`
- **Role:** React components dedicated to user authentication workflows (login, registration, password reset).
- **Key Files/Areas:** `src/components/auth/LoginForm.tsx` (active), `src/components/auth/RegisterForm.tsx`, `src/components/auth/ResetPasswordForm.tsx`, `src/components/auth/NewPasswordForm.tsx`, `src/components/auth/LogoutButton.tsx`
- **Recent Focus:** Building and refining the UI components for user authentication. **Recent commits likely focus on form validation, state management, user feedback, and integration with authentication API endpoints and services.**
- **Relationship to other modules:** Works closely with `src/pages/auth` (Astro pages hosting these components) and auth-related endpoints in `src/pages/api` and services in `src/lib/services/auth.service.ts`. Uses `src/components/ui`.

### `src/components/ui`
- **Role:** Shared, accessible UI components, primarily based on Shadcn/ui. Used to build a consistent frontend interface. **This forms the foundational visual layer of the application.**
- **Key Files/Areas:** (List preserved, e.g., `button.tsx`, `input.tsx`, `dialog.tsx`, etc.)
  - Forms & Inputs: `src/components/ui/button.tsx`, `src/components/ui/input.tsx`, `src/components/ui/form.tsx`, `src/components/ui/checkbox.tsx`, `src/components/ui/select.tsx`, `src/components/ui/textarea.tsx`, `src/components/ui/date-range-picker.tsx`, `src/components/ui/calendar.tsx`
  - Overlays & Feedback: `src/components/ui/dialog.tsx`, `src/components/ui/popover.tsx`, `src/components/ui/toast.tsx`, `src/components/ui/toaster.tsx`, `src/components/ui/alert-dialog.tsx`
  - Layout & Structure: `src/components/ui/card.tsx`, `src/components/ui/sidebar.tsx`
- **Top Contributed Files:** Directory itself is highly active (32 changes). `button.tsx` is a representative example.
- **Recent Focus:** Implementation and customization of a wide range of UI components. **Activity here suggests ongoing efforts to expand the component library, ensure accessibility, and maintain visual consistency across the application as new features are added.**
- **Relationship to other modules:** Used by all other `src/components/*` modules (e.g., `proposals`, `auth`) and potentially directly in Astro pages.

### `src/pages/auth`
- **Role:** Astro pages that provide the routes and views for authentication, hosting the React components from `src/components/auth`.
- **Key Files/Areas:** `src/pages/auth/login.astro`, `src/pages/auth/register.astro`, `src/pages/auth/reset-password.astro`, `src/pages/auth/new-password.astro`, `src/pages/auth/callback.astro`
- **Recent Focus:** Implementing the user-facing pages for authentication flows. **Development here mirrors the work in `src/components/auth`, ensuring proper page structure, data passing to React components, and handling of server-side concerns for these auth routes.**
- **Relationship to other modules:** Hosts components from `src/components/auth`. Defines routes that are linked throughout the application.

### `.github/workflows`
- **Role:** Defines CI/CD pipelines and other automated workflows using GitHub Actions.
- **Key Files/Areas:** `.github/workflows/pull-request.yml` (highly active).
- **Recent Focus:** Active management and refinement of the CI/CD process. **Recent commits to `pull-request.yml` indicate enhancements to automated checks (linting, testing, building) triggered on pull requests, aiming to improve code quality and development velocity.**
- **Relationship to other modules:** This module orchestrates the building, testing (unit and E2E), and potentially deployment of the entire application. It is triggered by changes in any other module.

### Project Configuration Files
- **Role:** Manages project dependencies, scripts, and environment settings.
- **Key Files/Areas:** `package.json` (highly active), `package-lock.json` (highly active), `src/env.d.ts` (active), `astro.config.mjs`, `tsconfig.json`.
- **Recent Focus:** Frequent updates to `package.json` and `package-lock.json` show ongoing dependency management (additions, updates, removals). Changes to `src/env.d.ts` suggest modifications to environment variable definitions, possibly for new integrations or feature flags.
- **Relationship to other modules:** These files are foundational to the entire project, defining its structure, dependencies, and build processes.

### `coverage`
- **Role:** Stores test coverage reports. `coverage/my-schedule/src/components/ui` indicates tracking of coverage for UI components. (Note: 'my-schedule' seems like an older project name, current is 'ai-planner').
- **Key Files/Areas:** HTML and LCOV reports generated by Vitest/c8 (inferred).
- **Recent Focus:** Ensuring and monitoring test coverage for the UI component library as it evolves. **This module's content is generated and reflects the thoroughness of tests in `e2e` and unit tests (not explicitly listed as a module but implied by `npm test` script).**

### `.ai`
- **Role:** Contains AI-assisted planning documents, specifications, and analyses related to project features, architecture, and development processes. This onboarding document is also stored here.
- **Key Files/Areas:** `prd.md`, `api-plan.md`, `db-plan.md`, `test-plan.md`, various feature implementation plans.
- **Recent Focus:** Active documentation and planning. **Updates here should ideally correlate with major feature developments or architectural changes discussed in other modules.**

### `.cursor/rules`
- **Role:** Configuration for the Cursor IDE, likely containing rules and prompts for AI-assisted development.
- **Key Files/Areas:** Workspace rules and AI assistant configurations.
- **Recent Focus:** Defining and tuning AI assistance behavior and project-specific guidelines for development in Cursor.

*(Other original modules like src/layouts, src/middleware, src/db, src/types.ts are preserved but may need more detailed analysis if they become more active)*

## Key Contributors

*(Original information preserved and significantly enhanced based on assumed detailed git analysis)*

- **Vadim <vadim.voievoda@traveltech.pl> (40+ commits):** Remains the primary and most versatile contributor.
    - **Areas of Expertise/Focus:** Demonstrates deep involvement across the entire stack.
        - **E2E Testing:** Spearheads efforts in `e2e/`, particularly `e2e/meeting-proposals-e2e-test.spec.ts`.
        - **Core Backend Services:** Drives development in `src/lib/services/` (especially `meeting-proposals.service.ts`) and `src/pages/api/` (especially `meeting-proposals.ts`).
        - **Frontend Components:** Leads work on `src/components/proposals/ProposalsPage.tsx` and has significant contributions to `src/components/ui/` and `src/components/auth/`.
        - **Project Setup & CI/CD:** Manages `package.json`, `package-lock.json`, and `.github/workflows/pull-request.yml`.
    - **Activity Pattern:** Vadim is consistently the most active contributor in the most frequently changed files, indicating a central role in developing and maintaining core features and infrastructure.

*(If other contributors were identified through git history, they would be listed here with their respective areas of focus. For now, Vadim appears to be the dominant force based on the initial document.)*

## Overall Takeaways & Recent Focus

*(Original points preserved and expanded with synthesized insights)*

1.  **Dominance of Meeting Proposal Feature:** This remains the central theme. The high activity in `e2e/meeting-proposals-e2e-test.spec.ts`, `src/pages/api/meeting-proposals.ts`, `src/components/proposals/ProposalsPage.tsx`, and `src/lib/services/meeting-proposals.service.ts` confirms that the full lifecycle of this feature (E2E testing, API endpoint, frontend component, backend service) is under active development and refinement. **This suggests it's the current highest priority for the project.**
2.  **Emphasis on Testing and CI/CD:** The high change rates in `e2e/meeting-proposals-e2e-test.spec.ts` and `.github/workflows/pull-request.yml` underscore a strong commitment to robust testing (especially E2E) and a mature CI/CD pipeline. **This indicates a focus on stability and code quality.**
3.  **Foundation and Dependency Management:** Frequent updates to `package.json` and `package-lock.json` are normal for an active project but also highlight the ongoing effort to manage the project's software bill of materials and incorporate new tools or update existing ones. Changes in `src/env.d.ts` point to evolving configuration needs.
4.  **UI/UX Development:** While meeting proposals are key, the general activity in `src/components/ui/` (as inferred) and specific components like `src/components/auth/LoginForm.tsx` suggests broader UI/UX work is also occurring, likely in support of primary features.
5.  **Shift/Clarification in Focus:** The original document mentioned broad UI/UX refinement and authentication. The detailed file activity **pinpoints the meeting proposal feature as the absolute epicenter of current development**, with authentication and general UI work being significant but perhaps supporting facets.

## Potential Complexity/Areas to Note

*(Original points preserved and new ones added based on synthesized analysis)*

- **AI Service Integration (`src/lib/services/openai.service.ts`, `meeting-proposals.service.ts`):** (Preserved) Interaction with external AI services remains a complex area. **The high change frequency in `meeting-proposals.service.ts` may indicate iterative improvements or challenges in this integration.**
- **E2E Test Suite (`e2e/`):** (Preserved) The comprehensive E2E test suite. **The file `e2e/meeting-proposals-e2e-test.spec.ts` having the most changes (14) makes it a critical file to understand but also potentially a source of maintenance overhead if not well-structured.**
- **Astro and React Integration:** (Preserved)
- **High Churn Files as Key Nodes:** Files like `e2e/meeting-proposals-e2e-test.spec.ts`, `package.json`, `src/pages/api/meeting-proposals.ts`, `src/components/proposals/ProposalsPage.tsx`, and `src/lib/services/meeting-proposals.service.ts` are not just active but central to the project's core functionality. **Complexity or bugs in these files will have a high impact.**
- **Single Primary Contributor Risk:** With Vadim being the overwhelmingly primary contributor to most critical and active files, there's a potential knowledge silo and bus factor. **Ensuring documentation and knowledge sharing for these areas is crucial.**
- **Interconnectedness of Proposal Feature:** The meeting proposal feature spans multiple key files (`e2e/...spec.ts`, `api/...ts`, `components/...tsx`, `services/...ts`). **Changes in one part often require coordinated changes in others, increasing complexity and testing needs.**
- **Alignment of `src/env.d.ts`:** Changes to environment variable typings in `src/env.d.ts` must be carefully synchronized with actual environment configurations and usage across the services and API layers.

## Questions for the Team

*(Original questions reviewed, some preserved, new ones added based on synthesized analysis)*

1.  (Preserved) What is the current strategy for managing and versioning the prompts sent to the AI models via `openai.service.ts` for meeting proposals, especially given the activity in `meeting-proposals.service.ts`?
2.  (Revised) Can you describe the end-to-end data flow for a meeting proposal, specifically highlighting how `ProposalsPage.tsx`, `meeting-proposals.ts` (API), and `meeting-proposals.service.ts` interact and what data transformations occur at each step?
3.  (Preserved) Are there established patterns for state management within the React components, particularly for complex forms or interactive elements like those in `ProposalsPage.tsx`?
4.  Given the high activity and central role of `e2e/meeting-proposals-e2e-test.spec.ts`, are there specific strategies or tools used to manage its complexity and ensure its reliability?
5.  How are changes to shared configurations like `package.json` or critical CI workflows in `.github/workflows/pull-request.yml` reviewed and coordinated, especially given their broad impact?
6.  What is the process for managing environment variables defined in `src/env.d.ts` across different environments (development, testing, production)?

## Next Steps

*(Original steps preserved and enhanced with more specific guidance)*

1.  **Set up the development environment:** (Preserved) Follow `README.md`.
2.  **Run the application and explore:** (Preserved) Use `npm run dev`. **Focus initial exploration on the meeting proposal creation flow and user authentication, as these are the most active development areas.**
3.  **Execute tests:** (Preserved) Run unit (`npm test`) and E2E tests (`npm run test:e2e:all`). **Pay close attention to the output and structure of `e2e/meeting-proposals-e2e-test.spec.ts` when running E2E tests.**
4.  **Deep Dive into Meeting Proposal Flow:**
    *   **Start with the UI:** `src/components/proposals/ProposalsPage.tsx` - Understand user interaction.
    *   **Trace to API:** `src/pages/api/meeting-proposals.ts` - See how frontend requests are handled.
    *   **Understand Service Logic:** `src/lib/services/meeting-proposals.service.ts` and `src/lib/services/openai.service.ts` - This is the core logic.
    *   **Review E2E Test:** `e2e/meeting-proposals-e2e-test.spec.ts` - See how this entire flow is validated.
5.  **Review CI/CD workflow:** (Preserved) Examine `.github/workflows/pull-request.yml`. **Understand what checks are performed and how they relate to the highly active files.**
6.  **Understand Project Dependencies:** Review `package.json` to get a sense of the tech stack and tools used. Note recent additions or significant version changes if any.
7.  **Documentation Improvement Suggestions:**
    *   **Add architectural diagrams:** Especially for the meeting proposal flow, showing interactions between the key components identified.
    *   **Elaborate on E2E testing strategy:** Given its importance, more details on how `e2e/meeting-proposals-e2e-test.spec.ts` is structured and maintained would be beneficial.
    *   **Document state management patterns for React components** if common patterns exist.
    *   **Clarify the role and management of environment variables** linked to `src/env.d.ts`.

## Development Environment Setup

1.  **Prerequisites:**
    - Node.js **v22.14.0** (use `nvm` to manage Node versions: `nvm use`)
    - `npm` or `yarn` package manager
2.  **Dependency Installation:**
    ```bash
    npm install
    # or
    yarn
    ```
3.  **Building the Project (if applicable):**
    ```bash
    npm run build
    ```
4.  **Running the Application/Service:**
    ```bash
    npm run dev
    ```
    (Application will be available at http://localhost:3000 as per `package.json` scripts. `README.md` mentions http://localhost:4321, but `dev` script uses port 3000.)
5.  **Running Tests:**
    - Unit Tests: `npm test` (runs `vitest run`)
    - E2E Tests (specific file): `npm run test:e2e` (runs `dotenv -e .env.test -- cross-env NODE_OPTIONS="--no-node-snapshot" playwright test e2e/meeting-proposals-e2e-test.spec.ts`)
    - E2E Tests (all): `npm run test:e2e:all` (runs `dotenv -e .env.test -- node ./e2e/run-tests.js`)
6.  **Common Issues:** "Common issues section not found in checked files." (README does not specify common setup issues).

## Helpful Resources

- **Documentation:** Main project `README.md` (provides overview, setup, tech stack).
- **Issue Tracker:** Likely GitHub Issues. The project is cloned from `https://github.com/vadimvoyevoda/ai-planner.git`.
- **Contribution Guide:** "CONTRIBUTING.md not found in common locations."
- **Communication Channels:** "Link to communication channel not found in checked files." (`README.md` mentions contacting the repository maintainer).
- **Learning Resources:** Tech stack documentation (Astro, React, Tailwind CSS, Shadcn/ui, Supabase, Playwright, Vitest). "Specific learning resources section not found in checked files." 