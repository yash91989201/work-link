# Frontend API Consumption Guide

This document explains how to consume the **oRPC API** from the frontend using **TanStack Query** and `queryUtils`.

---

## ⚙️ Setup

### API Client & Query Utils

The **oRPC client** and **queryUtils** are defined in `src/lib/orpc.ts`:

```ts
import { createClient } from "@orpc/client";
import { createQueryUtils } from "@orpc/react-query";
import type { AppRouterClient } from "@/server/routers";

export const client = createClient<AppRouterClient>({ url: "/rpc" });
export const queryUtils = createQueryUtils(client);
```

- `client` → raw oRPC client (not used directly in components).  
- `queryUtils` → exposes `.queryOptions` and `.mutationOptions` for every procedure, fully type-safe.  

---

## 🚀 Queries (Reads)

Use **`useSuspenseQuery`** (preferred) or `useQuery` for fetching data.

For guidance on implementing loading skeletons when using `useSuspenseQuery`, see  
[Loading Skeletons Guide](./loading-state.md).

```tsx
const { data: blog } = useSuspenseQuery(
  queryUtils.blog.getBlog.queryOptions({ input: { slug } })
);
```

---

## 📝 Mutations (Writes)

Use **`useMutation`** for all writes. Handle side-effects (e.g. `queryClient.invalidateQueries`) inside `onSuccess`.

```tsx
const { mutate: joinRoom } = useMutation(
  queryUtils.room.join.mutationOptions({
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryUtils.room.getMyRooms.queryKey(),
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  })
);
```

---

## ⚡ Options Support

- Any option that `useSuspenseQuery`, `useQuery`, or `useMutation` accepts can also be passed to `queryOptions` / `mutationOptions`.  
- Examples:  
  - Queries → `staleTime`, `enabled`, `select`, `refetchOnWindowFocus`, etc.  
  - Mutations → `onSuccess`, `onError`, `retry`, etc.  

This means you can configure your queries and mutations exactly like native TanStack Query hooks, while still keeping them fully type-safe through `queryUtils`.

---

## 🔒 Authentication

- Procedures defined with `protectedProcedure` require session/auth headers.  
- Normally handled automatically via cookies.  
- If needed, add custom headers in `orpc.ts` with a `fetch` override.  

---

## ✅ Rules Recap

1. Always use **`queryUtils`**, not the raw `client`.  
2. **Reads** → `useSuspenseQuery` / `useQuery`.  
3. **Writes** → `useMutation`.  
4. **Never call procedures directly** in components.  
5. **Use `queryClient.invalidateQueries` only inside mutation handlers.**  
6. Inputs/outputs are always type-safe, inferred from backend schemas.  
7. **All TanStack Query options** can be passed into `queryOptions` and `mutationOptions`.  
