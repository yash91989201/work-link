import { auth } from "@work-link/auth";
import { db } from "@work-link/db";
import type { Context as HonoContext } from "hono";

export type CreateContextOptions = {
  context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });

  return {
    headers: context.req.raw.headers,
    session,
    db,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
