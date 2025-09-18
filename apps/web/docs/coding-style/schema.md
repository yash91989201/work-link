# Schemas Coding Style Guidelines

<!--toc:start-->
- [Schemas Coding Style Guidelines](#schemas-coding-style-guidelines)
  - [1. Schema Definition](#1-schema-definition)
  - [2. Type Inference](#2-type-inference)
  - [3. File Organization](#3-file-organization)
  - [4. Consistency Rules](#4-consistency-rules)
  - [5. Monorepo Structure and Server Schemas](#5-monorepo-structure-and-server-schemas)
    - [Usage Guidelines](#usage-guidelines)
  - [Example Project Structure](#example-project-structure)
<!--toc:end-->

## 1. Schema Definition

- Always use **Zod** for schema definitions.
- Example:

```ts
import { z } from "zod";

export const UserSchema = z.object({
  name: z.string(),
  age: z.number().min(0),
});
```

## 2. Type Inference

- Types are **automatically generated** from Zod schemas and placed in `src/lib/types.ts`.
- **Do not modify** `lib/types.ts` manually - it is auto-generated.
- Import types directly from `src/lib/types.ts`.
- Example:

```ts
import type { User } from "@/lib/types";
```

## 3. File Organization

- Place all **schemas** in `src/lib/schemas/`.

Each schema should be in its own file (e.g., `user.ts`, `form.ts`). No nested directories.

- **Types** are automatically generated and placed in `src/lib/types.ts`.

This single file contains all inferred types from the schemas.

## 4. Consistency Rules

- Schema file names: use **lowercase with dashes or underscores** (e.g., `user-form.ts`).
- Type file names: match the schema name exactly.
- Always import types from `src/lib/types/`, never from schemas directly.

---

✅ This ensures:

- Single source of truth (schemas define structure + validation).
- Types remain consistent with schemas.
- Codebase stays organized and predictable.

## 5. Monorepo Structure and Server Schemas

- This project is a **monorepo** with apps like docs, native, server and web, this is the web app.
- The **server** also has its own schema and type directories for database tables and oRPC procedures:

`server/src/lib/schemas/` → database and oRPC schemas
`server/src/lib/types/` → database and oRPC types

- The alias path for accessing server-side schemas and types is configured as:

```json
"@server/lib/*": ["../server/src/lib/*"]
```

### Usage Guidelines

- **Frontend**: `@/lib/schemas` & `@/lib/types` for client schemas/types.

- **Backend**: `@server/lib/schemas` & `@server/lib/types` for server schemas/types.

- **Extending**: Import backend types for frontend use via `@server/lib/*`.

## Example Project Structure

```bash
src/
  lib/
    schemas/
      user.ts
      user-form.ts
    types.ts

server/
  src/
    lib/
      schemas/
      types/
