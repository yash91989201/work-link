import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const env = createEnv({
  server: {
    SUPABASE_URL: z.url(),
    SUPABASE_SECRET_KEY: z.string(),
    ELECTRIC_URL: z.url(),
    ELECTRIC_SECRET: z.string(),
  },
  runtimeEnv: process.env,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
