// AUTO-GENERATED FILE. DO NOT EDIT.
// Run `bun run generate:types` to refresh
import type { z } from "zod";

import type { CreateOrganizationFormSchema } from "@/lib/schemas/organization";
import type { LogInFormSchema } from "@/lib/schemas/auth";
import type { SignUpFormSchema } from "@/lib/schemas/auth";

export type CreateOrganizationFormType = z.infer<typeof CreateOrganizationFormSchema>;

export type LogInFormType = z.infer<typeof LogInFormSchema>;

export type SignUpFormType = z.infer<typeof SignUpFormSchema>;
