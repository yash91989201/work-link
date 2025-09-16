import { drizzle } from "drizzle-orm/bun-sql";
import * as authSchema from "@/db/schema/auth";
import { env } from "@/env";

export const db = drizzle(env.DATABASE_URL, {
  schema: {
    ...authSchema,
  },
});
