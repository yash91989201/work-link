import type { z } from "zod";
import type { LogInFormSchema, SignUpFormSchema } from "@/lib/schemas/auth";

export type LogInFormType = z.infer<typeof LogInFormSchema>;
export type SignUpFormType = z.infer<typeof SignUpFormSchema>;
