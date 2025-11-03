import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const env = createEnv({
  server: {
    ENV: z.string(),
    PORT: z.string().transform((val) => Number.parseInt(val, 10)),
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.url(),
    WEB_URL: z.url(),
    CORS_ORIGIN: z.string().transform((val) =>
      val.split(",").map((url) => {
        const trimmed = url.trim();
        z.url().parse(trimmed);
        return trimmed;
      })
    ),
    SUPABASE_URL: z.url(),
    SUPABASE_PUBLISHABLE_KEY: z.string(),
    SUPABASE_SECRET_KEY: z.string(),
    RESEND_API_KEY: z.string(),
  },
  runtimeEnv: process.env,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
