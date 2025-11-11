import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const env = createEnv({
  server: {
    CORS_ORIGIN: z.string().transform((val) =>
      val.split(",").map((url) => {
        const trimmed = url.trim();
        z.url().parse(trimmed);
        return trimmed;
      })
    ),
  },
  runtimeEnv: process.env,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
