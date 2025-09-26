# Procedures Coding Instructions

This document provides conventions and rules for generating **procedures** in the backend, which uses **Hono + oRPC**.
Follow these guidelines strictly to ensure consistency across all routers.

---

## 📂 Project Structure

```
src/
 ├─ lib/
 │   ├─ auth.ts
 │   ├─ context.ts
 │   ├─ orpc.ts
 │   └─ schema/
 │       ├─ db-tables.ts   # drizzle-zod derived DB table schemas
 │       ├─ post.ts    # feature-specific schemas
 │       ├─ comment.ts # feature-specific schemas
 │       └─ ...etc
 │
 ├─ routers/
 │   ├─ index.ts       # Root router, combines all routers
 │   ├─ hello.ts       # Example: simple procedures
 │   ├─ post/
 │   │   ├─ base.ts
 │   │   ├─ comment.ts
 │   │   └─ index.ts
 │   └─ organization.ts
 │
 └─ app.ts             # Main Hono app with rpcHandler + apiHandler
```

---

## 🧩 Context

Each procedure has access to the `Context` defined in `src/lib/context.ts`.

```ts
export type Context = {
  headers: Headers;
  session: Session | null;
  db: DatabaseClient;
};
```

- `headers`: Raw request headers
- `session`: Authenticated user session (nullable)
- `db`: Database client instance

Use the context inside procedures to access **session** (for auth) and **db** (for queries).

```ts
procedure: protectedProcedure
  .handler(async ({ context }) => {
    const userId = context.session.user.id; // Authenticated user ID
    // access database
    const posts = await context.db.post.findMany({ where: { authorId: userId } });
    return posts;
  });
```

---

## 🛠 Procedure Types

```ts
import { publicProcedure, protectedProcedure } from "@/lib/orpc";
```

- **`publicProcedure`** → accessible without authentication.
- **`protectedProcedure`** → requires authentication (`session?.user` must exist).

---

## 📑 Schema Usage

### General Rules

- **All schemas must be defined inside `src/lib/schema/`.**
- **Every procedure must define both an `input` schema and an `output` schema using `.input().output()`.**
- **Input schemas are only required if the procedure actually needs input parameters.**
- **If no input is required, use an empty `z.object({})` for future extensibility.**
- **Inline `z.*` definitions are not allowed.** Always import named schemas.
- Schema names must follow **`PascalCase + Input|Output`** convention.
  - Example: `CreatePostInput`, `CreatePostOutput`, `ListCommentsInput`, `ListCommentsOutput`.

### Building Output Schemas

**Leverage existing DB schemas** from `src/lib/schema/db-tables.ts` to build output schemas efficiently:

- **Use Zod schema methods** like `extend()`, `omit()`, `pick()`, `partial()`, `merge()` to modify existing schemas
- **Reuse select, create, update DB schemas** as the foundation for output schemas
- **Compose schemas** rather than duplicating field definitions

```ts
// src/lib/schema/post.ts
import { z } from "zod";
import { Post, CreatePost, UpdatePost } from "@/lib/schema/db-tables";

// Build output schemas from existing DB schemas
export const CreatePostOutput = CreatePost.extend({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GetPostOutput = Post.omit({
  internalNotes: true
}); // Remove sensitive fields

export const ListPostsOutput = z.array(
  Post.pick({
    id: true,
    title: true,
    createdAt: true
  })
); // Only include summary fields

// Input schema only when procedure needs parameters
export const CreatePostInput = CreatePost;
export const UpdatePostInput = UpdatePost.partial().extend({
  id: z.string(),
});
```

### Type Generation

- **Types are automatically generated** from Zod schemas using the project's auto type generator
- The generator detects all schemas in `src/lib/schemas/` directory
- All inferred types are consolidated in `src/lib/types.ts`
- **Do not modify** `src/lib/types.ts` manually - it is auto-generated and will be overwritten
- **Do not create manual type definitions** - the generator handles all `z.infer<typeof SchemaName>` conversions
- Import types directly from `@/lib/types` when required.

### Auto Type Generator

This project uses an **automatic type generator** that:

- Scans all files in `src/lib/schemas/` for Zod schema exports
- Generates TypeScript types using `z.infer<typeof SchemaName>`
- Consolidates all types into a single `src/lib/types.ts` file
- Runs automatically during build or when schemas change

This ensures:

- Single source of truth for types
- No manual type definitions needed
- Types always stay in sync with schemas
- Better developer experience with auto-completion

### Reusing DB Table Schemas

- **`src/lib/schema/db-tables.ts` contains DB table schemas derived using drizzle-zod.**
- These can be imported and reused when building input/output schemas.
- **Prefer schema composition** over field duplication using Zod methods:
  - `extend()` - Add new fields
  - `omit()` - Remove specific fields
  - `pick()` - Select only certain fields
  - `partial()` - Make all fields optional
  - `merge()` - Combine multiple schemas

```ts
// src/lib/schema/post.ts
import { z } from "zod";
import { Post, CreatePost } from "@/lib/schema/db-tables";

// Compose from existing schemas instead of redefining
export const CreatePostInput = CreatePost.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const CreatePostOutput = Post; // Use complete schema

export const PublicPostOutput = Post.omit({
  authorEmail: true,
  internalNotes: true
}); // Remove sensitive data
```

---

## ⚡ Writing Procedures

Every procedure must use **named input/output schemas** with the `.input().output()` pattern:

```ts
import { protectedProcedure } from "@/lib/orpc";
import { CreatePostInput, CreatePostOutput } from "@/lib/schema/post";

export const createPost = protectedProcedure
  .input(CreatePostInput)   // Named schema only
  .output(CreatePostOutput) // Named schema only
  .handler(async ({ input, context }) => {
    const post = await context.db.post.create({ data: input });
    return post;
  });
```

**For procedures without input parameters:**

```ts
import { publicProcedure } from "@/lib/orpc";
import { HealthCheckInput, HealthCheckOutput } from "@/lib/schema/health";

export const healthCheck = publicProcedure
  .input(HealthCheckInput)   // Use empty z.object({}) for extensibility
  .output(HealthCheckOutput) // Output schema is still required
  .handler(async ({ context }) => {
    return { status: "healthy", timestamp: new Date() };
  });
```

```ts
// src/lib/schema/health.ts
import { z } from "zod";

// Empty input schema for future extensibility
export const HealthCheckInput = z.object({});

export const HealthCheckOutput = z.object({
  status: z.string(),
  timestamp: z.date(),
});
```

---

## 📂 Routers

### 1. Single Router Example

```ts
// src/routers/hello.ts
import { publicProcedure } from "@/lib/orpc";
import { SayHelloInput, SayHelloOutput } from "@/lib/schema/hello";

export const helloRouter = {
  sayHello: publicProcedure
    .input(SayHelloInput)
    .output(SayHelloOutput)
    .handler(async ({ input }) => {
      return `Hello, ${input.name}`;
    }),
};
```

---

### 2. Sub-Router Example

```ts
// src/routers/post/base.ts
import { CreatePostInput, CreatePostOutput } from "@/lib/schema/post";

export const postBaseRouter = {
  create: protectedProcedure
    .input(CreatePostInput)
    .output(CreatePostOutput)
    .handler(async ({ input, context }) => {
      const post = await context.db.post.create({ data: input });
      return post;
    }),
};
```

```ts
// src/routers/post/comment.ts
import { ListCommentsInput, ListCommentsOutput } from "@/lib/schema/comment";

export const postCommentRouter = {
  listComments: publicProcedure
    .input(ListCommentsInput)
    .output(ListCommentsOutput)
    .handler(async ({ input, context }) => {
      return context.db.comment.findMany({ where: { postId: input.postId } });
    }),
};
```

```ts
// src/routers/post/index.ts
import { postBaseRouter } from "./base";
import { postCommentRouter } from "./comment";

export const postRouter = {
  ...postBaseRouter,
  ...postCommentRouter,
};
```

---

## 📦 Root Router

```ts
import { helloRouter } from "./hello";
import { postRouter } from "./post";
import { organizationRouter } from "./organization";
import { publicProcedure } from "@/lib/orpc";
import { HealthCheckOutput } from "@/lib/schema/health";

export const appRouter = {
  healthCheck: publicProcedure
    .output(HealthCheckOutput)
    .handler(() => "OK"),
  hello: helloRouter,
  post: postRouter,
  organization: organizationRouter,
};
```

---

## ✅ Rules Recap

1. **Schemas** → always in `src/lib/schema/`.
2. **DB Table Schemas** → available in `src/lib/schema/db-tables.ts` (from drizzle-zod). Use as foundation for building other schemas.
3. **Schema composition** → prefer `extend()`, `omit()`, `pick()`, `partial()`, `merge()` over field duplication.
4. **Schema names** → must be `PascalCase + Input|Output`.
5. **No inline `z.*` calls** in `.input()` or `.output()`.
6. **Every procedure requires `.input().output()`** - input schema only needed if procedure accepts parameters.
7. **No manual types** → `src/lib/types.ts` is auto-generated from schemas.
8. **Use `protectedProcedure`** when session is required.
9. **Router structure** →
   - Single-file routers for simple cases.
   - Multi-file routers merged in `index.ts`.
