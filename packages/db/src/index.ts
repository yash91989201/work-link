import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/schema";

export const db = drizzle(
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
  {
    schema,
  }
);
