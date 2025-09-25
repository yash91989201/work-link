import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const env = createEnv({
  server: {
    ENV: z.string(),
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.url(),
    CORS_ORIGIN: z.url(),
    SUPABASE_URL: z.url(),
    SUPABASE_PUBLISHABLE_KEY: z.string(),
    SUPABASE_SECRET_KEY: z.string(),
  },
  runtimeEnv: process.env,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
