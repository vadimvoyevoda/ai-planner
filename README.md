# AIPersonalPlanner

AI-powered meeting scheduling and event planning assistant

## Project Description

AIPersonalPlanner is a web application that leverages artificial intelligence to streamline the process of planning meetings and events. It analyzes user preferences, notes, and time availability to propose optimal meeting times.

The application is primarily designed for:
- Self-employed professionals
- Managers
- Anyone with numerous meetings who needs an efficient scheduling tool

### Key Features
- **AI-Powered Scheduling**: Analyzes notes to generate meeting suggestions
- **Smart Preferences**: Learns your scheduling preferences and priorities
- **Meeting Management**: Easy creation, editing, and deletion of meetings
- **Google Calendar Integration**: One-way synchronization to export your meetings
- **Outfit Suggestions**: AI recommends appropriate attire based on meeting type

## Tech Stack

### Frontend
- Astro 5 for fast, efficient page rendering
- React 19 for interactive components
- TypeScript 5 for type safety
- Tailwind 4 for styling
- Shadcn/ui for accessible UI components

### Testing
- Vitest/Jest for unit testing
- React Testing Library for component testing
- Playwright/Cypress for E2E testing

### Backend
- Supabase as a comprehensive backend solution
- PostgreSQL database
- Built-in user authentication

### AI Integration
- Openrouter.ai for communication with various AI models
- Access to models from OpenAI, Anthropic, Google, and others

### CI/CD & Hosting
- GitHub Actions for CI/CD pipelines
- DigitalOcean for hosting via Docker images

## Getting Started Locally

### Prerequisites
- Node.js **v22.14.0** (use [nvm](https://github.com/nvm-sh/nvm) to manage Node versions)
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone https://github.com/vadimvoyevoda/ai-planner.git
cd ai-planner
```

2. Use correct Node.js version
```bash
nvm use
```

3. Install dependencies
```bash
npm install
# or
yarn
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

5. Open your browser and navigate to http://localhost:4321

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build locally
- `npm run astro` - Run Astro CLI commands
- `npm run lint` - Run ESLint to check for code issues
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code using Prettier

## Project Scope

### Included in MVP
- User account system (registration, login, profile management)
- Meeting preferences configuration
- Meeting management (creation, editing, deletion)
- AI integration for scheduling suggestions
- Google Calendar integration (one-way export)
- Responsive UI for desktop and mobile

### Not Included in MVP
- Import of data from various formats (PDF, DOCX, etc.)
- Rich multimedia support
- Meeting plan sharing with other users
- Social features
- Advanced meeting filtering
- Meeting reminder system
- Recurring meetings functionality
- Two-way calendar synchronization
- AI proposal editing capabilities

## Project Status

- Current version: 0.0.1
- Status: Early development

The project is currently in early development phase. Core functionality is being implemented according to the requirements document.

### Success Metrics
We aim to achieve:
- 90% of users with completed meeting preferences
- 75% of users generating 3+ meeting plans per year
- 75% AI proposal acceptance rate
- AI proposal generation in under 5 seconds
- 99.5% system availability
- Page load times under 2 seconds

## License

This project is currently proprietary software. No license has been specified for public use.

---

**Note**: This README will be updated as the project evolves. For questions or more information, please contact the repository maintainer.


<!-- Security scan triggered at 2025-09-01 23:54:03 -->

<!-- Security scan triggered at 2025-09-09 05:24:46 -->