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

- Do not manually write TypeScript types that duplicate schema definitions.  
- Instead, generate types directly from Zod schemas using `z.infer`.  
- Example:

```ts
import type { z } from "zod";
import { UserSchema } from "@/lib/schemas/user";

export type User = z.infer<typeof UserSchema>;
```

## 3. File Organization

- Place all **schemas** in:

```
src/lib/schemas/
```

Each schema should be in its own file (e.g., `user.ts`, `form.ts`).  

- Place all **types** inferred from schemas in:

```
src/lib/types/
```

Each file should mirror the schema filename
(e.g., `user.ts` type file for `user.ts` schema file).

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

- This project is a **monorepo** with repos like docs, native, server and web, this is the web repo.
- The **server** also has its own schema and type directories for database tables and oRPC procedures:

```
server/src/lib/schemas/   → database and oRPC schemas
server/src/lib/types/     → database and oRPC types
```

- The alias path for accessing server-side schemas and types is configured as:

```json
"@server/lib/*": ["../server/src/lib/*"]
```

### Usage Guidelines

- **Frontend usage**:  
  Use `@/lib/schemas` and `@/lib/types` for client-side schemas and types.  

- **Backend usage**:  
  Use `@server/lib/schemas` and `@server/lib/types` when you need access to server-side schemas or types, such as database models or oRPC procedure inputs/outputs.  

- **Extending or sharing**:  
  If you need to extend backend types for frontend use, import them through the `@server/lib/*` alias to ensure consistency.

## Example Project Structure

```
src/
  lib/
    schemas/
      user.ts
      user-form.ts
    types/
      user.ts
      user-form.ts

server/
  src/
    lib/
      schemas/
      types/
```
