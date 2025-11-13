// AUTO-GENERATED FILE. DO NOT EDIT.
// Run `bun run generate:types` to refresh
import type { z } from "zod";

import type { AcceptInvitationFormSchema } from "@/lib/schemas/auth";
import type { AddMemberFormSchema } from "@/lib/schemas/memeber/add-member";
import type { CreateChannelFormSchema } from "@/lib/schemas/memeber/channel";
import type { CreateOrgFormSchema } from "@/lib/schemas/org";
import type { CreateTeamFormSchema } from "@/lib/schemas/admin/team";
import type { InviteAdminFormSchema } from "@/lib/schemas/owner/index";
import type { InviteMemberFormSchema } from "@/lib/schemas/admin/member";
import type { JoinChannelRequestFormSchema } from "@/lib/schemas/memeber/join-channel-request";
import type { LogInFormSchema } from "@/lib/schemas/auth";
import type { ModifyChannelMembersSchema } from "@/lib/schemas/memeber/channel";
import type { SignUpFormSchema } from "@/lib/schemas/auth";

export type AcceptInvitationFormType = z.infer<typeof AcceptInvitationFormSchema>;
export type AddMemberFormType = z.infer<typeof AddMemberFormSchema>;
export type CreateChannelFormType = z.infer<typeof CreateChannelFormSchema>;
export type CreateOrgFormType = z.infer<typeof CreateOrgFormSchema>;
export type CreateTeamFormType = z.infer<typeof CreateTeamFormSchema>;
export type InviteAdminFormType = z.infer<typeof InviteAdminFormSchema>;
export type InviteMemberFormType = z.infer<typeof InviteMemberFormSchema>;
export type JoinChannelRequestFormType = z.infer<typeof JoinChannelRequestFormSchema>;
export type LogInFormType = z.infer<typeof LogInFormSchema>;
export type ModifyChannelMembersType = z.infer<typeof ModifyChannelMembersSchema>;
export type SignUpFormType = z.infer<typeof SignUpFormSchema>;
