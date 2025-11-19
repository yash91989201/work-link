import { auth } from "@work-link/auth";
import { db } from "@work-link/db";
import type { Context as HonoContext } from "hono";
import type { RedisClient } from "@/lib/services/redis";

export type CreateContextOptions = {
  context: HonoContext;
  redis?: RedisClient;
};

export async function createContext({
  context,
  redis,
}: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });

  return {
    headers: context.req.raw.headers,
    session,
    db,
    redis,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
