// AUTO-GENERATED FILE. DO NOT EDIT.
// Run `bun run generate:types` to refresh
import type { z } from "zod";

import type { AccountInsertSchema } from "@/lib/schemas/db-tables";
import type { AccountSchema } from "@/lib/schemas/db-tables";
import type { AccountUpdateSchema } from "@/lib/schemas/db-tables";
import type { AttachmentInsertSchema } from "@/lib/schemas/db-tables";
import type { AttachmentSchema } from "@/lib/schemas/db-tables";
import type { AttachmentTypeSchema } from "@/lib/schemas/attachment";
import type { AttachmentUpdateSchema } from "@/lib/schemas/db-tables";
import type { AttendanceInsertSchema } from "@/lib/schemas/db-tables";
import type { AttendanceSchema } from "@/lib/schemas/db-tables";
import type { AttendanceUpdateSchema } from "@/lib/schemas/db-tables";
import type { ChannelInsertSchema } from "@/lib/schemas/db-tables";
import type { ChannelMemberInsertSchema } from "@/lib/schemas/db-tables";
import type { ChannelMemberSchema } from "@/lib/schemas/db-tables";
import type { ChannelMemberUpdateSchema } from "@/lib/schemas/db-tables";
import type { ChannelSchema } from "@/lib/schemas/db-tables";
import type { ChannelTypeSchema } from "@/lib/schemas/db-tables";
import type { ChannelUpdateSchema } from "@/lib/schemas/db-tables";
import type { FeatureSchema } from "@/lib/schemas/module";
import type { InvitationInsertSchema } from "@/lib/schemas/db-tables";
import type { InvitationSchema } from "@/lib/schemas/db-tables";
import type { InvitationUpdateSchema } from "@/lib/schemas/db-tables";
import type { MemberInsertSchema } from "@/lib/schemas/db-tables";
import type { MemberSchema } from "@/lib/schemas/db-tables";
import type { MemberUpdateSchema } from "@/lib/schemas/db-tables";
import type { MessageInsertSchema } from "@/lib/schemas/db-tables";
import type { MessageReadInsertSchema } from "@/lib/schemas/db-tables";
import type { MessageReadSchema } from "@/lib/schemas/db-tables";
import type { MessageReadUpdateSchema } from "@/lib/schemas/db-tables";
import type { MessageSchema } from "@/lib/schemas/db-tables";
import type { MessageTypeSchema } from "@/lib/schemas/message";
import type { MessageUpdateSchema } from "@/lib/schemas/db-tables";
import type { ModuleSchema } from "@/lib/schemas/module";
import type { NotificationInsertSchema } from "@/lib/schemas/db-tables";
import type { NotificationSchema } from "@/lib/schemas/db-tables";
import type { NotificationStatusSchema } from "@/lib/schemas/notification";
import type { NotificationTypeSchema } from "@/lib/schemas/notification";
import type { NotificationUpdateSchema } from "@/lib/schemas/db-tables";
import type { OrganizationInsertSchema } from "@/lib/schemas/db-tables";
import type { OrganizationSchema } from "@/lib/schemas/db-tables";
import type { OrganizationUpdateSchema } from "@/lib/schemas/db-tables";
import type { RoleSchema } from "@/lib/schemas/module";
import type { SessionInsertSchema } from "@/lib/schemas/db-tables";
import type { SessionSchema } from "@/lib/schemas/db-tables";
import type { SessionUpdateSchema } from "@/lib/schemas/db-tables";
import type { TeamInsertSchema } from "@/lib/schemas/db-tables";
import type { TeamMemberInsertSchema } from "@/lib/schemas/db-tables";
import type { TeamMemberSchema } from "@/lib/schemas/db-tables";
import type { TeamMemberUpdateSchema } from "@/lib/schemas/db-tables";
import type { TeamSchema } from "@/lib/schemas/db-tables";
import type { TeamUpdateSchema } from "@/lib/schemas/db-tables";
import type { UserInsertSchema } from "@/lib/schemas/db-tables";
import type { UserPresenceInsertSchema } from "@/lib/schemas/db-tables";
import type { UserPresenceSchema } from "@/lib/schemas/db-tables";
import type { UserPresenceUpdateSchema } from "@/lib/schemas/db-tables";
import type { UserSchema } from "@/lib/schemas/db-tables";
import type { UserUpdateSchema } from "@/lib/schemas/db-tables";
import type { VerificationInsertSchema } from "@/lib/schemas/db-tables";
import type { VerificationSchema } from "@/lib/schemas/db-tables";
import type { VerificationUpdateSchema } from "@/lib/schemas/db-tables";
import type { bulkUpdatePresenceSchema } from "@/lib/schemas/presence";
import type { getChannelOnlineUsersSchema } from "@/lib/schemas/presence";
import type { getMultipleUserPresenceSchema } from "@/lib/schemas/presence";
import type { getOrganizationOnlineUsersSchema } from "@/lib/schemas/presence";
import type { getOrganizationPresenceStatsSchema } from "@/lib/schemas/presence";
import type { getUserPresenceHistorySchema } from "@/lib/schemas/presence";
import type { getUserPresenceSchema } from "@/lib/schemas/presence";
import type { getUsersInChannelSchema } from "@/lib/schemas/presence";
import type { presenceStatsSchema } from "@/lib/schemas/presence";
import type { presenceUpdateResultSchema } from "@/lib/schemas/presence";
import type { setStatusSchema } from "@/lib/schemas/presence";
import type { setTypingSchema } from "@/lib/schemas/presence";
import type { updateCustomStatusSchema } from "@/lib/schemas/presence";
import type { updateLastSeenSchema } from "@/lib/schemas/presence";
import type { updatePresenceSchema } from "@/lib/schemas/presence";
import type { userPresenceInfoSchema } from "@/lib/schemas/presence";
import type { userStatusSchema } from "@/lib/schemas/presence";

export type AccountInsertType = z.infer<typeof AccountInsertSchema>;

export type AccountType = z.infer<typeof AccountSchema>;

export type AccountUpdateType = z.infer<typeof AccountUpdateSchema>;

export type AttachmentInsertType = z.infer<typeof AttachmentInsertSchema>;

export type AttachmentType = z.infer<typeof AttachmentSchema>;

export type AttachmentTypeType = z.infer<typeof AttachmentTypeSchema>;

export type AttachmentUpdateType = z.infer<typeof AttachmentUpdateSchema>;

export type AttendanceInsertType = z.infer<typeof AttendanceInsertSchema>;

export type AttendanceType = z.infer<typeof AttendanceSchema>;

export type AttendanceUpdateType = z.infer<typeof AttendanceUpdateSchema>;

export type ChannelInsertType = z.infer<typeof ChannelInsertSchema>;

export type ChannelMemberInsertType = z.infer<typeof ChannelMemberInsertSchema>;

export type ChannelMemberType = z.infer<typeof ChannelMemberSchema>;

export type ChannelMemberUpdateType = z.infer<typeof ChannelMemberUpdateSchema>;

export type ChannelType = z.infer<typeof ChannelSchema>;

export type ChannelTypeType = z.infer<typeof ChannelTypeSchema>;

export type ChannelUpdateType = z.infer<typeof ChannelUpdateSchema>;

export type FeatureType = z.infer<typeof FeatureSchema>;

export type InvitationInsertType = z.infer<typeof InvitationInsertSchema>;

export type InvitationType = z.infer<typeof InvitationSchema>;

export type InvitationUpdateType = z.infer<typeof InvitationUpdateSchema>;

export type MemberInsertType = z.infer<typeof MemberInsertSchema>;

export type MemberType = z.infer<typeof MemberSchema>;

export type MemberUpdateType = z.infer<typeof MemberUpdateSchema>;

export type MessageInsertType = z.infer<typeof MessageInsertSchema>;

export type MessageReadInsertType = z.infer<typeof MessageReadInsertSchema>;

export type MessageReadType = z.infer<typeof MessageReadSchema>;

export type MessageReadUpdateType = z.infer<typeof MessageReadUpdateSchema>;

export type MessageType = z.infer<typeof MessageSchema>;

export type MessageTypeType = z.infer<typeof MessageTypeSchema>;

export type MessageUpdateType = z.infer<typeof MessageUpdateSchema>;

export type ModuleType = z.infer<typeof ModuleSchema>;

export type NotificationInsertType = z.infer<typeof NotificationInsertSchema>;

export type NotificationStatusType = z.infer<typeof NotificationStatusSchema>;

export type NotificationType = z.infer<typeof NotificationSchema>;

export type NotificationTypeType = z.infer<typeof NotificationTypeSchema>;

export type NotificationUpdateType = z.infer<typeof NotificationUpdateSchema>;

export type OrganizationInsertType = z.infer<typeof OrganizationInsertSchema>;

export type OrganizationType = z.infer<typeof OrganizationSchema>;

export type OrganizationUpdateType = z.infer<typeof OrganizationUpdateSchema>;

export type RoleType = z.infer<typeof RoleSchema>;

export type SessionInsertType = z.infer<typeof SessionInsertSchema>;

export type SessionType = z.infer<typeof SessionSchema>;

export type SessionUpdateType = z.infer<typeof SessionUpdateSchema>;

export type TeamInsertType = z.infer<typeof TeamInsertSchema>;

export type TeamMemberInsertType = z.infer<typeof TeamMemberInsertSchema>;

export type TeamMemberType = z.infer<typeof TeamMemberSchema>;

export type TeamMemberUpdateType = z.infer<typeof TeamMemberUpdateSchema>;

export type TeamType = z.infer<typeof TeamSchema>;

export type TeamUpdateType = z.infer<typeof TeamUpdateSchema>;

export type UserInsertType = z.infer<typeof UserInsertSchema>;

export type UserPresenceInsertType = z.infer<typeof UserPresenceInsertSchema>;

export type UserPresenceType = z.infer<typeof UserPresenceSchema>;

export type UserPresenceUpdateType = z.infer<typeof UserPresenceUpdateSchema>;

export type UserType = z.infer<typeof UserSchema>;

export type UserUpdateType = z.infer<typeof UserUpdateSchema>;

export type VerificationInsertType = z.infer<typeof VerificationInsertSchema>;

export type VerificationType = z.infer<typeof VerificationSchema>;

export type VerificationUpdateType = z.infer<typeof VerificationUpdateSchema>;

export type bulkUpdatePresenceType = z.infer<typeof bulkUpdatePresenceSchema>;

export type getChannelOnlineUsersType = z.infer<typeof getChannelOnlineUsersSchema>;

export type getMultipleUserPresenceType = z.infer<typeof getMultipleUserPresenceSchema>;

export type getOrganizationOnlineUsersType = z.infer<typeof getOrganizationOnlineUsersSchema>;

export type getOrganizationPresenceStatsType = z.infer<typeof getOrganizationPresenceStatsSchema>;

export type getUserPresenceHistoryType = z.infer<typeof getUserPresenceHistorySchema>;

export type getUserPresenceType = z.infer<typeof getUserPresenceSchema>;

export type getUsersInChannelType = z.infer<typeof getUsersInChannelSchema>;

export type presenceStatsType = z.infer<typeof presenceStatsSchema>;

export type presenceUpdateResultType = z.infer<typeof presenceUpdateResultSchema>;

export type setStatusType = z.infer<typeof setStatusSchema>;

export type setTypingType = z.infer<typeof setTypingSchema>;

export type updateCustomStatusType = z.infer<typeof updateCustomStatusSchema>;

export type updateLastSeenType = z.infer<typeof updateLastSeenSchema>;

export type updatePresenceType = z.infer<typeof updatePresenceSchema>;

export type userPresenceInfoType = z.infer<typeof userPresenceInfoSchema>;

export type userStatusType = z.infer<typeof userStatusSchema>;
