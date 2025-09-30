// AUTO-GENERATED FILE. DO NOT EDIT.
// Run `bun run generate:types` to refresh
import type { z } from "zod";

import type { AccountInsertSchema } from "@/lib/schemas/db-tables";
import type { AccountSchema } from "@/lib/schemas/db-tables";
import type { AddChannelMemberInput } from "@/lib/schemas/channel";
import type { AddReactionInput } from "@/lib/schemas/message";
import type { ArchiveChannelInput } from "@/lib/schemas/channel";
import type { AttachmentInsertSchema } from "@/lib/schemas/db-tables";
import type { AttachmentOutput } from "@/lib/schemas/attachment";
import type { AttachmentSchema } from "@/lib/schemas/db-tables";
import type { AttachmentTypeSchema } from "@/lib/schemas/attachment";
import type { AttachmentsListOutput } from "@/lib/schemas/attachment";
import type { AttachmentsWithChannelListOutput } from "@/lib/schemas/attachment";
import type { AttachmentsWithMessageListOutput } from "@/lib/schemas/attachment";
import type { AttendanceInsertSchema } from "@/lib/schemas/db-tables";
import type { AttendanceSchema } from "@/lib/schemas/db-tables";
import type { ChannelInsertSchema } from "@/lib/schemas/db-tables";
import type { ChannelMemberInsertSchema } from "@/lib/schemas/db-tables";
import type { ChannelMemberOutput } from "@/lib/schemas/channel";
import type { ChannelMemberSchema } from "@/lib/schemas/db-tables";
import type { ChannelMembersListOutput } from "@/lib/schemas/channel";
import type { ChannelOutput } from "@/lib/schemas/channel";
import type { ChannelSchema } from "@/lib/schemas/db-tables";
import type { ChannelsListOutput } from "@/lib/schemas/channel";
import type { CreateAnnouncementNotificationInput } from "@/lib/schemas/notification";
import type { CreateAttachmentInput } from "@/lib/schemas/attachment";
import type { CreateBulkAttachmentsInput } from "@/lib/schemas/attachment";
import type { CreateBulkNotificationsInput } from "@/lib/schemas/notification";
import type { CreateChannelInviteNotificationInput } from "@/lib/schemas/notification";
import type { CreateNotificationInput } from "@/lib/schemas/notification";
import type { CreateSystemNotificationInput } from "@/lib/schemas/notification";
import type { DeleteAttachmentInput } from "@/lib/schemas/attachment";
import type { DeleteAttachmentOutput } from "@/lib/schemas/attachment";
import type { DeleteChannelInput } from "@/lib/schemas/channel";
import type { DeleteMessageInput } from "@/lib/schemas/message";
import type { DeleteNotificationInput } from "@/lib/schemas/notification";
import type { DismissNotificationInput } from "@/lib/schemas/notification";
import type { FeatureSchema } from "@/lib/schemas/module";
import type { GetAttachmentInput } from "@/lib/schemas/attachment";
import type { GetChannelAttachmentsInput } from "@/lib/schemas/attachment";
import type { GetChannelInput } from "@/lib/schemas/channel";
import type { GetChannelMembersInput } from "@/lib/schemas/channel";
import type { GetChannelMembersOutput } from "@/lib/schemas/channel";
import type { GetChannelMessagesInput } from "@/lib/schemas/message";
import type { GetChannelMessagesOutput } from "@/lib/schemas/message";
import type { GetChannelsInput } from "@/lib/schemas/channel";
import type { GetDirectMessagesInput } from "@/lib/schemas/message";
import type { GetMessageAttachmentsInput } from "@/lib/schemas/attachment";
import type { GetMessageInput } from "@/lib/schemas/message";
import type { GetMultipleMessageAttachmentsInput } from "@/lib/schemas/attachment";
import type { GetNotificationsInput } from "@/lib/schemas/notification";
import type { GetRecentAttachmentsInput } from "@/lib/schemas/attachment";
import type { GetStorageStatsInput } from "@/lib/schemas/attachment";
import type { GetThreadMessagesInput } from "@/lib/schemas/message";
import type { GetUnreadCountInput } from "@/lib/schemas/message";
import type { GetUserAttachmentsInput } from "@/lib/schemas/attachment";
import type { InvitationInsertSchema } from "@/lib/schemas/db-tables";
import type { InvitationSchema } from "@/lib/schemas/db-tables";
import type { JoinChannelInput } from "@/lib/schemas/channel";
import type { LeaveChannelInput } from "@/lib/schemas/channel";
import type { ListChannelsInput } from "@/lib/schemas/channel";
import type { ListChannelsOutput } from "@/lib/schemas/channel";
import type { MarkMessageAsReadInput } from "@/lib/schemas/message";
import type { MarkMultipleAsReadInput } from "@/lib/schemas/notification";
import type { MarkNotificationAsReadInput } from "@/lib/schemas/notification";
import type { MemberInsertSchema } from "@/lib/schemas/db-tables";
import type { MemberSchema } from "@/lib/schemas/db-tables";
import type { MessageAttachmentOutput } from "@/lib/schemas/message";
import type { MessageInsertSchema } from "@/lib/schemas/db-tables";
import type { MessageOutput } from "@/lib/schemas/message";
import type { MessageReadInsertSchema } from "@/lib/schemas/db-tables";
import type { MessageReadSchema } from "@/lib/schemas/db-tables";
import type { MessageSchema } from "@/lib/schemas/db-tables";
import type { MessageTypeSchema } from "@/lib/schemas/message";
import type { MessagesListOutput } from "@/lib/schemas/message";
import type { ModuleSchema } from "@/lib/schemas/module";
import type { NotificationInsertSchema } from "@/lib/schemas/db-tables";
import type { NotificationOutput } from "@/lib/schemas/notification";
import type { NotificationSchema } from "@/lib/schemas/db-tables";
import type { NotificationStatusSchema } from "@/lib/schemas/notification";
import type { NotificationTypeSchema } from "@/lib/schemas/notification";
import type { NotificationsListOutput } from "@/lib/schemas/notification";
import type { OrganizationInsertSchema } from "@/lib/schemas/db-tables";
import type { OrganizationSchema } from "@/lib/schemas/db-tables";
import type { RecentAttachmentOutput } from "@/lib/schemas/attachment";
import type { RecentAttachmentsListOutput } from "@/lib/schemas/attachment";
import type { RemoveChannelMemberInput } from "@/lib/schemas/channel";
import type { RemoveReactionInput } from "@/lib/schemas/message";
import type { RoleSchema } from "@/lib/schemas/module";
import type { SearchAttachmentsInput } from "@/lib/schemas/attachment";
import type { SearchMessageOutput } from "@/lib/schemas/message";
import type { SearchMessagesInput } from "@/lib/schemas/message";
import type { SearchMessagesListOutput } from "@/lib/schemas/message";
import type { SessionInsertSchema } from "@/lib/schemas/db-tables";
import type { SessionSchema } from "@/lib/schemas/db-tables";
import type { StorageStatsOutput } from "@/lib/schemas/attachment";
import type { SuccessOutput } from "@/lib/schemas/channel";
import type { TeamInsertSchema } from "@/lib/schemas/db-tables";
import type { TeamMemberInsertSchema } from "@/lib/schemas/db-tables";
import type { TeamMemberSchema } from "@/lib/schemas/db-tables";
import type { TeamSchema } from "@/lib/schemas/db-tables";
import type { ThreadMessageOutput } from "@/lib/schemas/message";
import type { ThreadMessagesListOutput } from "@/lib/schemas/message";
import type { UnreadCountOutput } from "@/lib/schemas/message";
import type { UpdateAttachmentInput } from "@/lib/schemas/attachment";
import type { UpdateChannelInput } from "@/lib/schemas/channel";
import type { UpdateChannelMemberInput } from "@/lib/schemas/channel";
import type { UpdateMessageInput } from "@/lib/schemas/message";
import type { UserInsertSchema } from "@/lib/schemas/db-tables";
import type { UserSchema } from "@/lib/schemas/db-tables";
import type { VerificationInsertSchema } from "@/lib/schemas/db-tables";
import type { VerificationSchema } from "@/lib/schemas/db-tables";

export type AccountInsertType = z.infer<typeof AccountInsertSchema>;

export type AccountType = z.infer<typeof AccountSchema>;

export type AddChannelMemberInputType = z.infer<typeof AddChannelMemberInput>;

export type AddReactionInputType = z.infer<typeof AddReactionInput>;

export type ArchiveChannelInputType = z.infer<typeof ArchiveChannelInput>;

export type AttachmentInsertType = z.infer<typeof AttachmentInsertSchema>;

export type AttachmentOutputType = z.infer<typeof AttachmentOutput>;

export type AttachmentType = z.infer<typeof AttachmentSchema>;

export type AttachmentTypeType = z.infer<typeof AttachmentTypeSchema>;

export type AttachmentsListOutputType = z.infer<typeof AttachmentsListOutput>;

export type AttachmentsWithChannelListOutputType = z.infer<typeof AttachmentsWithChannelListOutput>;

export type AttachmentsWithMessageListOutputType = z.infer<typeof AttachmentsWithMessageListOutput>;

export type AttendanceInsertType = z.infer<typeof AttendanceInsertSchema>;

export type AttendanceType = z.infer<typeof AttendanceSchema>;

export type ChannelInsertType = z.infer<typeof ChannelInsertSchema>;

export type ChannelMemberInsertType = z.infer<typeof ChannelMemberInsertSchema>;

export type ChannelMemberOutputType = z.infer<typeof ChannelMemberOutput>;

export type ChannelMemberType = z.infer<typeof ChannelMemberSchema>;

export type ChannelMembersListOutputType = z.infer<typeof ChannelMembersListOutput>;

export type ChannelOutputType = z.infer<typeof ChannelOutput>;

export type ChannelType = z.infer<typeof ChannelSchema>;

export type ChannelsListOutputType = z.infer<typeof ChannelsListOutput>;

export type CreateAnnouncementNotificationInputType = z.infer<typeof CreateAnnouncementNotificationInput>;

export type CreateAttachmentInputType = z.infer<typeof CreateAttachmentInput>;

export type CreateBulkAttachmentsInputType = z.infer<typeof CreateBulkAttachmentsInput>;

export type CreateBulkNotificationsInputType = z.infer<typeof CreateBulkNotificationsInput>;

export type CreateChannelInviteNotificationInputType = z.infer<typeof CreateChannelInviteNotificationInput>;

export type CreateNotificationInputType = z.infer<typeof CreateNotificationInput>;

export type CreateSystemNotificationInputType = z.infer<typeof CreateSystemNotificationInput>;

export type DeleteAttachmentInputType = z.infer<typeof DeleteAttachmentInput>;

export type DeleteAttachmentOutputType = z.infer<typeof DeleteAttachmentOutput>;

export type DeleteChannelInputType = z.infer<typeof DeleteChannelInput>;

export type DeleteMessageInputType = z.infer<typeof DeleteMessageInput>;

export type DeleteNotificationInputType = z.infer<typeof DeleteNotificationInput>;

export type DismissNotificationInputType = z.infer<typeof DismissNotificationInput>;

export type FeatureType = z.infer<typeof FeatureSchema>;

export type GetAttachmentInputType = z.infer<typeof GetAttachmentInput>;

export type GetChannelAttachmentsInputType = z.infer<typeof GetChannelAttachmentsInput>;

export type GetChannelInputType = z.infer<typeof GetChannelInput>;

export type GetChannelMembersInputType = z.infer<typeof GetChannelMembersInput>;

export type GetChannelMembersOutputType = z.infer<typeof GetChannelMembersOutput>;

export type GetChannelMessagesInputType = z.infer<typeof GetChannelMessagesInput>;

export type GetChannelMessagesOutputType = z.infer<typeof GetChannelMessagesOutput>;

export type GetChannelsInputType = z.infer<typeof GetChannelsInput>;

export type GetDirectMessagesInputType = z.infer<typeof GetDirectMessagesInput>;

export type GetMessageAttachmentsInputType = z.infer<typeof GetMessageAttachmentsInput>;

export type GetMessageInputType = z.infer<typeof GetMessageInput>;

export type GetMultipleMessageAttachmentsInputType = z.infer<typeof GetMultipleMessageAttachmentsInput>;

export type GetNotificationsInputType = z.infer<typeof GetNotificationsInput>;

export type GetRecentAttachmentsInputType = z.infer<typeof GetRecentAttachmentsInput>;

export type GetStorageStatsInputType = z.infer<typeof GetStorageStatsInput>;

export type GetThreadMessagesInputType = z.infer<typeof GetThreadMessagesInput>;

export type GetUnreadCountInputType = z.infer<typeof GetUnreadCountInput>;

export type GetUserAttachmentsInputType = z.infer<typeof GetUserAttachmentsInput>;

export type InvitationInsertType = z.infer<typeof InvitationInsertSchema>;

export type InvitationType = z.infer<typeof InvitationSchema>;

export type JoinChannelInputType = z.infer<typeof JoinChannelInput>;

export type LeaveChannelInputType = z.infer<typeof LeaveChannelInput>;

export type ListChannelsInputType = z.infer<typeof ListChannelsInput>;

export type ListChannelsOutputType = z.infer<typeof ListChannelsOutput>;

export type MarkMessageAsReadInputType = z.infer<typeof MarkMessageAsReadInput>;

export type MarkMultipleAsReadInputType = z.infer<typeof MarkMultipleAsReadInput>;

export type MarkNotificationAsReadInputType = z.infer<typeof MarkNotificationAsReadInput>;

export type MemberInsertType = z.infer<typeof MemberInsertSchema>;

export type MemberType = z.infer<typeof MemberSchema>;

export type MessageAttachmentOutputType = z.infer<typeof MessageAttachmentOutput>;

export type MessageInsertType = z.infer<typeof MessageInsertSchema>;

export type MessageOutputType = z.infer<typeof MessageOutput>;

export type MessageReadInsertType = z.infer<typeof MessageReadInsertSchema>;

export type MessageReadType = z.infer<typeof MessageReadSchema>;

export type MessageType = z.infer<typeof MessageSchema>;

export type MessageTypeType = z.infer<typeof MessageTypeSchema>;

export type MessagesListOutputType = z.infer<typeof MessagesListOutput>;

export type ModuleType = z.infer<typeof ModuleSchema>;

export type NotificationInsertType = z.infer<typeof NotificationInsertSchema>;

export type NotificationOutputType = z.infer<typeof NotificationOutput>;

export type NotificationStatusType = z.infer<typeof NotificationStatusSchema>;

export type NotificationType = z.infer<typeof NotificationSchema>;

export type NotificationTypeType = z.infer<typeof NotificationTypeSchema>;

export type NotificationsListOutputType = z.infer<typeof NotificationsListOutput>;

export type OrganizationInsertType = z.infer<typeof OrganizationInsertSchema>;

export type OrganizationType = z.infer<typeof OrganizationSchema>;

export type RecentAttachmentOutputType = z.infer<typeof RecentAttachmentOutput>;

export type RecentAttachmentsListOutputType = z.infer<typeof RecentAttachmentsListOutput>;

export type RemoveChannelMemberInputType = z.infer<typeof RemoveChannelMemberInput>;

export type RemoveReactionInputType = z.infer<typeof RemoveReactionInput>;

export type RoleType = z.infer<typeof RoleSchema>;

export type SearchAttachmentsInputType = z.infer<typeof SearchAttachmentsInput>;

export type SearchMessageOutputType = z.infer<typeof SearchMessageOutput>;

export type SearchMessagesInputType = z.infer<typeof SearchMessagesInput>;

export type SearchMessagesListOutputType = z.infer<typeof SearchMessagesListOutput>;

export type SessionInsertType = z.infer<typeof SessionInsertSchema>;

export type SessionType = z.infer<typeof SessionSchema>;

export type StorageStatsOutputType = z.infer<typeof StorageStatsOutput>;

export type SuccessOutputType = z.infer<typeof SuccessOutput>;

export type TeamInsertType = z.infer<typeof TeamInsertSchema>;

export type TeamMemberInsertType = z.infer<typeof TeamMemberInsertSchema>;

export type TeamMemberType = z.infer<typeof TeamMemberSchema>;

export type TeamType = z.infer<typeof TeamSchema>;

export type ThreadMessageOutputType = z.infer<typeof ThreadMessageOutput>;

export type ThreadMessagesListOutputType = z.infer<typeof ThreadMessagesListOutput>;

export type UnreadCountOutputType = z.infer<typeof UnreadCountOutput>;

export type UpdateAttachmentInputType = z.infer<typeof UpdateAttachmentInput>;

export type UpdateChannelInputType = z.infer<typeof UpdateChannelInput>;

export type UpdateChannelMemberInputType = z.infer<typeof UpdateChannelMemberInput>;

export type UpdateMessageInputType = z.infer<typeof UpdateMessageInput>;

export type UserInsertType = z.infer<typeof UserInsertSchema>;

export type UserType = z.infer<typeof UserSchema>;

export type VerificationInsertType = z.infer<typeof VerificationInsertSchema>;

export type VerificationType = z.infer<typeof VerificationSchema>;
