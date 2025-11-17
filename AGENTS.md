# Work Link - Agent Instructions

This document provides essential information for AI agents working effectively in the Work Link codebase.

## Project Overview

Work Link is a modern communication and collaboration platform built with a full-stack TypeScript architecture. It features real-time messaging, team management, attendance tracking, and multi-platform support (web, mobile, desktop).

### Architecture

- **Monorepo**: Uses Turborepo for optimized builds and dependency management
- **Full-Stack TypeScript**: End-to-end type safety from database to UI
- **Multi-Platform**: Web (React), Mobile (React Native/Expo), Desktop (Tauri)
- **Real-time**: Electric SQL for real-time data synchronization
- **API-First**: Hono server with oRPC for type-safe APIs

## Essential Commands

### Development
```bash
# Install dependencies
bun install

# Start all applications in development mode
bun dev

# Start specific applications
bun dev:web      # Web app on port 3001
bun dev:server   # API server on port 3000
bun dev:native   # React Native development server

# Type checking
bun check-types

# Linting and formatting
bun check
```

### Database Operations
```bash
# Push schema changes to database
bun db:push

# Generate database types
bun db:generate

# Run migrations
bun db:migrate

# Open database studio UI
bun db:studio
```

### Building
```bash
# Build all applications
bun build

# Build specific applications
cd apps/web && bun build
cd apps/server && bun build

# Desktop apps
cd apps/web && bun desktop:dev    # Development
cd apps/web && bun desktop:build  # Production build
```

### Documentation
```bash
cd apps/docs && bun dev    # Start documentation site
cd apps/docs && bun build  # Build documentation site
```

## Project Structure

```
work-link/
├── apps/
│   ├── web/              # React web application
│   │   ├── src/
│   │   │   ├── components/     # Reusable UI components
│   │   │   ├── contexts/       # React contexts
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── lib/            # Utility libraries
│   │   │   ├── routes/         # File-based routing
│   │   │   ├── stores/         # State management (Zustand)
│   │   │   └── utils/          # Utility functions
│   │   └── src-tauri/          # Tauri desktop app
│   ├── native/           # React Native mobile app
│   ├── docs/             # Astro documentation site
│   └── server/           # Hono API server
├── packages/
│   ├── api/              # API layer and business logic
│   │   ├── src/
│   │   │   ├── lib/            # Shared utilities
│   │   │   ├── routers/        # API route definitions
│   │   │   └── schemas/        # Zod schemas
│   ├── auth/             # Authentication (Better Auth)
│   └── db/               # Database layer (Drizzle ORM)
│       ├── src/
│       │   ├── schema/         # Database table definitions
│       │   ├── lib/            # Database utilities
│       │   └── migrations/     # Database migrations
│       └── supabase/           # Supabase configuration
```

## Technology Stack

### Core Technologies
- **Runtime**: Bun
- **Language**: TypeScript
- **Package Manager**: Bun workspaces
- **Monorepo**: Turborepo
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth
- **Real-time**: Electric SQL

### Frontend (Web)
- **Framework**: React 19
- **Routing**: TanStack Router (file-based)
- **State Management**: Zustand + TanStack Query
- **UI Library**: Radix UI + TailwindCSS
- **Forms**: React Hook Form + Zod validation
- **Rich Text**: TipTap editor
- **Desktop**: Tauri

### Frontend (Mobile)
- **Framework**: React Native
- **Development**: Expo
- **Navigation**: React Navigation

### Backend
- **Server**: Hono
- **API**: oRPC (type-safe APIs with OpenAPI)
- **Validation**: Zod
- **Real-time**: Electric SQL integration

### Documentation
- **Framework**: Astro
- **Theme**: Starlight

## Code Patterns and Conventions

### File Organization
- Use `index.ts` for barrel exports
- Group related files in subdirectories (e.g., `components/member/communication/`)
- Use kebab-case for filenames
- Place test files alongside source files

### Component Patterns
- Use functional components with hooks
- Prefer composition over inheritance
- Use TypeScript interfaces for props
- Implement proper loading states
- Follow accessibility guidelines (see `.github/copilot-instructions.md`)

### State Management
- **Global State**: Zustand stores (e.g., `message-list-store.ts`)
- **Server State**: TanStack Query for API data
- **Local State**: React useState/useReducer
- **Real-time**: Electric SQL for database subscriptions

### API Patterns
- Use oRPC for type-safe APIs
- Organize routers by domain (e.g., `communication`, `member`, `admin`)
- Use Zod schemas for validation
- Implement proper error handling
- Use context injection for user/session data

### Database Patterns
- Use Drizzle ORM with PostgreSQL
- Define tables with proper relations
- Use CUID2 for primary keys
- Implement soft deletes where appropriate
- Use proper indexing for performance

### Styling
- Use TailwindCSS for styling
- Follow component-based architecture
- Use CSS variables for theming
- Implement dark mode support
- Use responsive design patterns

## Key Features and Modules

### Communication System
- **Channels**: Team, group, and direct messaging
- **Messages**: Text, attachments, audio, with threading
- **Real-time**: Electric SQL for live updates
- **Rich Text**: TipTap editor with mentions, links
- **File Upload**: Supabase storage integration
- **Notifications**: In-app notifications for mentions/messages

### Authentication & Authorization
- **Auth**: Better Auth with multiple providers
- **Roles**: Owner, admin, member with permission levels
- **Organizations**: Multi-tenant architecture
- **Teams**: Team-based access control

### Attendance System
- **Tracking**: Mark attendance with location/time
- **Analytics**: Data visualization and reporting
- **Leave Management**: Balance tracking and requests

### Admin Features
- **Dashboard**: Overview of organization activity
- **User Management**: Invite and manage members
- **Team Management**: Create and manage teams
- **Channel Management**: Oversee communication channels

## Development Workflow

### Code Quality
- **Linting**: Oxlint + Biome with ultracite rules
- **Formatting**: Biome formatter
- **Type Checking**: TypeScript strict mode
- **Git Hooks**: Husky + lint-staged for pre-commit checks
- **Testing**: Component and integration tests (add as needed)

### Database Changes
1. Update schema in `packages/db/src/schema/`
2. Run `bun db:push` to apply changes
3. Run `bun db:generate` to update types
4. Test changes locally

### API Changes
1. Update schemas in `packages/api/src/lib/schemas/`
2. Update routers in `packages/api/src/routers/`
3. Test with OpenAPI documentation at `/api-reference`
4. Update client-side usage

### Frontend Changes
1. Follow established component patterns
2. Use proper TypeScript typing
3. Implement responsive design
4. Test across platforms (web, mobile, desktop)

## Environment Configuration

### Required Environment Variables
- Database connection strings
- Authentication provider secrets
- File storage credentials
- CORS origins
- API keys for external services

### Environment Files
- Root: `.env` for shared variables
- Apps: `.env.local` for app-specific variables
- Templates: `.env.example` files for reference

## Testing

### Current State
- Test framework not yet implemented
- Plan to add Vitest for unit/integration tests
- Plan to add Playwright for E2E tests
- Component testing with React Testing Library

### Testing Strategy
- Unit tests for utilities and hooks
- Integration tests for API routes
- Component tests for UI components
- E2E tests for critical user flows

## Deployment

### Development
- Use `bun dev` for local development
- All apps run simultaneously with hot reload

### Production
- Build with `bun build`
- Deploy apps independently
- Use Docker containers for server deployment
- Static hosting for web app

### Database
- Use PostgreSQL in production
- Run migrations with `bun db:migrate`
- Set up proper backups and monitoring

## Common Gotchas

### Import Paths
- Use `@/` aliases for internal imports
- Use workspace names for cross-package imports (e.g., `@work-link/api`)
- Check `tsconfig.json` for path mappings

### Real-time Features
- Electric SQL requires proper setup
- Handle connection states gracefully
- Use proper subscription cleanup

### File Uploads
- Use Supabase storage for file uploads
- Implement proper progress indicators
- Handle file size and type restrictions

### Styling
- TailwindCSS v4 has different configuration
- Use `@tailwindcss/vite` plugin
- Check `tailwind.config.js` for custom settings

### Type Safety
- Always use TypeScript strict mode
- Run `bun check-types` before committing
- Use Zod for runtime validation

## Performance Considerations

### Frontend
- Use React.memo for expensive components
- Implement virtual scrolling for long lists
- Use TanStack Query caching effectively
- Optimize bundle size with code splitting

### Backend
- Use proper database indexing
- Implement pagination for large datasets
- Use connection pooling for database
- Cache frequently accessed data

### Database
- Monitor query performance
- Use proper foreign key constraints
- Implement soft deletes for data retention
- Archive old data regularly

## Security Best Practices

### Authentication
- Use secure session handling
- Implement proper CSRF protection
- Use HTTPS in production
- Validate all user inputs

### Data Protection
- Encrypt sensitive data at rest
- Use proper authorization checks
- Implement rate limiting
- Log security events

### API Security
- Validate all inputs with Zod schemas
- Use proper CORS configuration
- Implement authentication middleware
- Sanitize all outputs

## Getting Help

### Documentation
- Check `apps/docs/` for project documentation
- Review component examples in `apps/web/src/components/`
- Check API documentation at `/api-reference` when server is running

### Code Examples
- Look at existing components for patterns
- Check hooks for state management examples
- Review API routers for endpoint patterns
- Examine database schemas for data models

### Troubleshooting
- Check console logs for errors
- Verify environment variables
- Check database connections
- Review browser network tab for API issues

---

**Remember**: This is a living document. Update it as the project evolves and new patterns emerge.