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
- **Every procedure must define both an `input` schema and an `output` schema.**  
- **Inline `z.*` definitions are not allowed.** Always import named schemas.  
- Schema names must follow **`PascalCase + Input|Output`** convention.  
  - Example: `CreatePostInput`, `CreatePostOutput`, `ListCommentsInput`, `ListCommentsOutput`.

### Reusing DB Table Schemas

- **`src/lib/schema/db-tables.ts` contains DB table schemas derived using drizzle-zod.**  
- These can be imported and reused when building input/output schemas.  
- Example: reuse `Post` schema and extend/trim it for procedure outputs.

```ts
// src/lib/schema/post.ts
import { z } from "zod";
import { Post } from "@/lib/schema"; // drizzle-zod derived schema

export const CreatePostInput = z.object({
  title: Post.shape.title,
  content: Post.shape.content.optional(),
});

export const CreatePostOutput = Post; // reuse directly
```

---

## ⚡ Writing Procedures

Every procedure must use **named input/output schemas**:

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
2. **DB Table Schemas** → available in `src/lib/schema/db-tables.ts` (from drizzle-zod). Can be reused.  
3. **Schema names** → must be `PascalCase + Input|Output`.  
4. **No inline `z.*` calls** in `.input()` or `.output()`.  
5. **Every procedure requires both `input` and `output` schemas.**  
6. **Use `protectedProcedure`** when session is required.  
7. **Router structure** →  
   - Single-file routers for simple cases.  
   - Multi-file routers merged in `index.ts`.  
