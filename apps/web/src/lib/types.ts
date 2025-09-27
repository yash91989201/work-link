// AUTO-GENERATED FILE. DO NOT EDIT.
// Run `bun run generate:types` to refresh
import type { z } from "zod";

import type { AcceptInvitationFormSchema } from "@/lib/schemas/auth";
import type { CreateOrgFormSchema } from "@/lib/schemas/org";
import type { CreateTeamFormSchema } from "@/lib/schemas/admin";
import type { InviteAdminFormSchema } from "@/lib/schemas/owner";
import type { InviteMemberFormSchema } from "@/lib/schemas/admin";
import type { LogInFormSchema } from "@/lib/schemas/auth";
import type { SignUpFormSchema } from "@/lib/schemas/auth";

export type AcceptInvitationFormType = z.infer<typeof AcceptInvitationFormSchema>;

export type CreateOrgFormType = z.infer<typeof CreateOrgFormSchema>;

export type CreateTeamFormType = z.infer<typeof CreateTeamFormSchema>;

export type InviteAdminFormType = z.infer<typeof InviteAdminFormSchema>;

export type InviteMemberFormType = z.infer<typeof InviteMemberFormSchema>;

export type LogInFormType = z.infer<typeof LogInFormSchema>;

export type SignUpFormType = z.infer<typeof SignUpFormSchema>;
