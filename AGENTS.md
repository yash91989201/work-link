# Better-T-Stack Project Rules

This is a work-link project created with Better-T-Stack CLI.

## Project Structure

This is a monorepo with the following structure:

- **`apps/web/`** - Frontend application (React with TanStack Router)

- **`apps/server/`** - Backend server (Hono)

- **`apps/native/`** - React Native mobile app (with NativeWind)

## Available Scripts

- `bun run dev` - Start all apps in development mode
- `bun run dev:web` - Start only the web app
- `bun run dev:server` - Start only the server
- `bun run dev:native` - Start only the native app

## Database Commands

All database operations should be run from the server workspace:

- `bun run db:push` - Push schema changes to database
- `bun run db:studio` - Open database studio
- `bun run db:generate` - Generate Drizzle files
- `bun run db:migrate` - Run database migrations

Database schema files are located in `apps/server/src/db/schema/`

## API Structure

- oRPC endpoints are in `apps/server/src/api/`
- Client-side API utils are in `apps/web/src/utils/api.ts`

## Authentication

Authentication is enabled in this project:

- Server auth logic is in `apps/server/src/lib/auth.ts`
- Web app auth client is in `apps/web/src/lib/auth-client.ts`
- Native app auth client is in `apps/native/src/lib/auth-client.ts`

## Adding More Features

You can add additional addons or deployment options to your project using:

```bash
bunx create-better-t-stack
add
```

Available addons you can add:

- **Documentation**: Starlight, Fumadocs
- **Linting**: Biome, Oxlint, Ultracite
- **Other**: Ruler, Turborepo, PWA, Tauri, Husky

You can also add web deployment configurations like Cloudflare Workers support.

## Project Configuration

This project includes a `bts.jsonc` configuration file that stores your Better-T-Stack settings:

- Contains your selected stack configuration (database, ORM, backend, frontend, etc.)
- Used by the CLI to understand your project structure
- Safe to delete if not needed
- Updated automatically when using the `add` command

## Key Points

- This is a Turborepo monorepo using bun workspaces
- Each app has its own `package.json` and dependencies
- Run commands from the root to execute across all workspaces
- Run workspace-specific commands with `bun run command-name`
- Turborepo handles build caching and parallel execution
- Use `bunx
create-better-t-stack add` to add more features later

## Operations performed by the assistant

- 2025-09-18: Verified and/or created documentation for authentication at `apps/web/docs/technical/auth.md`. The file follows the project's schema-style guidelines and documents Better Auth client/server setup, file organization, environment variables, usage patterns, and best practices.
- Updated AGENTS.md to include this operation record.
- 2025-09-18: Updated schema-related documentation files to reflect the auto type generator system that detects all schemas in `lib/schemas` and generates types in `lib/types.ts`. Updated files: `apps/web/docs/coding-style/schema.md`, `apps/web/docs/technical/form-schema.md`, `apps/web/docs/technical/simple-form.md`, `apps/web/docs/technical/complex-form.md`. Enhanced sections explaining the automatic type generation process and its benefits.
- 2025-09-18: Updated server documentation at `apps/server/docs/technical/procedure.md` to include detailed information about the auto type generator system that detects all schemas in `lib/schemas` and generates types in `lib/types.ts`. Enhanced the Type Generation section with explanations of the automatic process and its benefits.
