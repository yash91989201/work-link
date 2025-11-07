import { createClient } from "@supabase/supabase-js";
import type { Database } from "@work-link/db/lib/supabase/types";

export const supabase = createClient<Database>(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SECRET_KEY as string
);
