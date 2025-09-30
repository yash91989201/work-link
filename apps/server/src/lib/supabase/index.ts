import { createClient } from "@supabase/supabase-js";
import { env } from "@/env";
import type { Database } from "./types";

export const supabase = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_SECRET_KEY
);
