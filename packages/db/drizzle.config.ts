import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";
import { env } from "@/env";

dotenv.config({
  path: "../../apps/server/.env",
});

export default defineConfig({
  schema: "./src/schema",
  out: "./src/migrations",
  dialect: "postgresql",
  casing: "camelCase",
  dbCredentials: {
    url: env.DATABASE_URL as string,
  },
});
