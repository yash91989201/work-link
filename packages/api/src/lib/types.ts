// AUTO-GENERATED FILE. DO NOT EDIT.
// Run `bun run generate:types` to refresh
import type { z } from "zod";
import type {
  AttachmentOutput,
  AttachmentsListOutput,
  AttachmentsWithChannelListOutput,
  AttachmentsWithMessageListOutput,
  AttachmentTypeSchema,
  AttachmentWithChannelOutput,
  AttachmentWithMessageOutput,
  CreateAttachmentInput,
  CreateBulkAttachmentsInput,
  DeleteAttachmentInput,
  DeleteAttachmentOutput,
  GetAttachmentInput,
  GetChannelAttachmentsInput,
  GetMessageAttachmentsInput,
  GetMultipleMessageAttachmentsInput,
  GetRecentAttachmentsInput,
  GetStorageStatsInput,
  GetUserAttachmentsInput,
  RecentAttachmentOutput,
  RecentAttachmentsListOutput,
  SearchAttachmentsInput,
  StorageStatsOutput,
  UpdateAttachmentInput,
} from "@/lib/schemas/attachment";
import type {
  MemberAttendanceStatusOutput,
  MemberPunchInInput,
  MemberPunchInOutput,
  MemberPunchOutInput,
  MemberPunchOutOutput,
} from "@/lib/schemas/attendance";
import type {
  AddChannelMembersInput,
  ArchiveChannelInput,
  ChannelJoinRequestOutput,
  ChannelOutput,
  ChannelsListOutput,
  ChannelWithCreatorOutput,
  ChannelWithStatsOutput,
  CreateChannelInput,
  CreateChannelOutput,
  DeleteChannelInput,
  GetChannelInput,
  GetChannelOutput,
  GetChannelsInput,
  IsChannelMemberInput,
  IsChannelMemberOutput,
  JoinChannelInput,
  LeaveChannelInput,
  ListChannelMembersInput,
  ListChannelMembersOutput,
  ListChannelsInput,
  ListChannelsOutput,
  ListJoinRequestInput,
  ListJoinRequestOutput,
  RemoveChannelMemberInput,
  SuccessOutput,
  UpdateChannelInput,
  UpdateChannelMemberInput,
} from "@/lib/schemas/channel";
import type {
  AddReactionInput,
  CreateMessageInput,
  CreateMessageOutput,
  DeleteMessageInput,
  GetChannelMessagesInput,
  GetChannelMessagesOutput,
  GetDirectMessagesInput,
  GetMenionUsersInput,
  GetMenionUsersOutput,
  GetMessageInput,
  GetMessageOutput,
  GetPinnedMessagesInput,
  GetPinnedMessagesOutput,
  GetThreadMessagesInput,
  GetUnreadCountInput,
  MarkMessageAsReadInput,
  MessageAttachmentOutput,
  MessageOutput,
  MessagesListOutput,
  MessageTypeSchema,
  MessageWithSenderSchema,
  PinMessageInput,
  PinMessageOutput,
  RemoveReactionInput,
  SearchMessageOutput,
  SearchMessagesInput,
  SearchMessagesListOutput,
  SearchUsersInput,
  SearchUsersOutput,
  ThreadMessageOutput,
  UnPinMessageInput,
  UnPinMessageOutput,
  UnreadCountOutput,
  UpdateMessageInput,
  UpdateMessageOutput,
} from "@/lib/schemas/message";
import type {
  FeatureSchema,
  ModuleSchema,
  RoleSchema,
} from "@/lib/schemas/module";
import type {
  CreateAnnouncementNotificationInput,
  CreateBulkNotificationsInput,
  CreateChannelInviteNotificationInput,
  CreateNotificationInput,
  CreateSystemNotificationInput,
  DeleteNotificationInput,
  DismissNotificationInput,
  GetNotificationsInput,
  MarkMultipleAsReadInput,
  MarkNotificationAsReadInput,
  NotificationOutput,
  NotificationStatusSchema,
  NotificationTypeSchema,
} from "@/lib/schemas/notification";

export type AddChannelMembersInputType = z.infer<typeof AddChannelMembersInput>;
export type AddReactionInputType = z.infer<typeof AddReactionInput>;
export type ArchiveChannelInputType = z.infer<typeof ArchiveChannelInput>;
export type AttachmentOutputType = z.infer<typeof AttachmentOutput>;
export type AttachmentTypeType = z.infer<typeof AttachmentTypeSchema>;
export type AttachmentWithChannelOutputType = z.infer<
  typeof AttachmentWithChannelOutput
>;
export type AttachmentWithMessageOutputType = z.infer<
  typeof AttachmentWithMessageOutput
>;
export type AttachmentsListOutputType = z.infer<typeof AttachmentsListOutput>;
export type AttachmentsWithChannelListOutputType = z.infer<
  typeof AttachmentsWithChannelListOutput
>;
export type AttachmentsWithMessageListOutputType = z.infer<
  typeof AttachmentsWithMessageListOutput
>;
export type ChannelJoinRequestOutputType = z.infer<
  typeof ChannelJoinRequestOutput
>;
export type ChannelOutputType = z.infer<typeof ChannelOutput>;
export type ChannelWithCreatorOutputType = z.infer<
  typeof ChannelWithCreatorOutput
>;
export type ChannelWithStatsOutputType = z.infer<typeof ChannelWithStatsOutput>;
export type ChannelsListOutputType = z.infer<typeof ChannelsListOutput>;
export type CreateAnnouncementNotificationInputType = z.infer<
  typeof CreateAnnouncementNotificationInput
>;
export type CreateAttachmentInputType = z.infer<typeof CreateAttachmentInput>;
export type CreateBulkAttachmentsInputType = z.infer<
  typeof CreateBulkAttachmentsInput
>;
export type CreateBulkNotificationsInputType = z.infer<
  typeof CreateBulkNotificationsInput
>;
export type CreateChannelInputType = z.infer<typeof CreateChannelInput>;
export type CreateChannelInviteNotificationInputType = z.infer<
  typeof CreateChannelInviteNotificationInput
>;
export type CreateChannelOutputType = z.infer<typeof CreateChannelOutput>;
export type CreateMessageInputType = z.infer<typeof CreateMessageInput>;
export type CreateMessageOutputType = z.infer<typeof CreateMessageOutput>;
export type CreateNotificationInputType = z.infer<
  typeof CreateNotificationInput
>;
export type CreateSystemNotificationInputType = z.infer<
  typeof CreateSystemNotificationInput
>;
export type DeleteAttachmentInputType = z.infer<typeof DeleteAttachmentInput>;
export type DeleteAttachmentOutputType = z.infer<typeof DeleteAttachmentOutput>;
export type DeleteChannelInputType = z.infer<typeof DeleteChannelInput>;
export type DeleteMessageInputType = z.infer<typeof DeleteMessageInput>;
export type DeleteNotificationInputType = z.infer<
  typeof DeleteNotificationInput
>;
export type DismissNotificationInputType = z.infer<
  typeof DismissNotificationInput
>;
export type FeatureType = z.infer<typeof FeatureSchema>;
export type GetAttachmentInputType = z.infer<typeof GetAttachmentInput>;
export type GetChannelAttachmentsInputType = z.infer<
  typeof GetChannelAttachmentsInput
>;
export type GetChannelInputType = z.infer<typeof GetChannelInput>;
export type GetChannelMessagesInputType = z.infer<
  typeof GetChannelMessagesInput
>;
export type GetChannelMessagesOutputType = z.infer<
  typeof GetChannelMessagesOutput
>;
export type GetChannelOutputType = z.infer<typeof GetChannelOutput>;
export type GetChannelsInputType = z.infer<typeof GetChannelsInput>;
export type GetDirectMessagesInputType = z.infer<typeof GetDirectMessagesInput>;
export type GetMenionUsersInputType = z.infer<typeof GetMenionUsersInput>;
export type GetMenionUsersOutputType = z.infer<typeof GetMenionUsersOutput>;
export type GetMessageAttachmentsInputType = z.infer<
  typeof GetMessageAttachmentsInput
>;
export type GetMessageInputType = z.infer<typeof GetMessageInput>;
export type GetMessageOutputType = z.infer<typeof GetMessageOutput>;
export type GetMultipleMessageAttachmentsInputType = z.infer<
  typeof GetMultipleMessageAttachmentsInput
>;
export type GetNotificationsInputType = z.infer<typeof GetNotificationsInput>;
export type GetPinnedMessagesInputType = z.infer<typeof GetPinnedMessagesInput>;
export type GetPinnedMessagesOutputType = z.infer<
  typeof GetPinnedMessagesOutput
>;
export type GetRecentAttachmentsInputType = z.infer<
  typeof GetRecentAttachmentsInput
>;
export type GetStorageStatsInputType = z.infer<typeof GetStorageStatsInput>;
export type GetThreadMessagesInputType = z.infer<typeof GetThreadMessagesInput>;
export type GetUnreadCountInputType = z.infer<typeof GetUnreadCountInput>;
export type GetUserAttachmentsInputType = z.infer<
  typeof GetUserAttachmentsInput
>;
export type IsChannelMemberInputType = z.infer<typeof IsChannelMemberInput>;
export type IsChannelMemberOutputType = z.infer<typeof IsChannelMemberOutput>;
export type JoinChannelInputType = z.infer<typeof JoinChannelInput>;
export type LeaveChannelInputType = z.infer<typeof LeaveChannelInput>;
export type ListChannelMembersInputType = z.infer<
  typeof ListChannelMembersInput
>;
export type ListChannelMembersOutputType = z.infer<
  typeof ListChannelMembersOutput
>;
export type ListChannelsInputType = z.infer<typeof ListChannelsInput>;
export type ListChannelsOutputType = z.infer<typeof ListChannelsOutput>;
export type ListJoinRequestInputType = z.infer<typeof ListJoinRequestInput>;
export type ListJoinRequestOutputType = z.infer<typeof ListJoinRequestOutput>;
export type MarkMessageAsReadInputType = z.infer<typeof MarkMessageAsReadInput>;
export type MarkMultipleAsReadInputType = z.infer<
  typeof MarkMultipleAsReadInput
>;
export type MarkNotificationAsReadInputType = z.infer<
  typeof MarkNotificationAsReadInput
>;
export type MemberAttendanceStatusOutputType = z.infer<
  typeof MemberAttendanceStatusOutput
>;
export type MemberPunchInInputType = z.infer<typeof MemberPunchInInput>;
export type MemberPunchInOutputType = z.infer<typeof MemberPunchInOutput>;
export type MemberPunchOutInputType = z.infer<typeof MemberPunchOutInput>;
export type MemberPunchOutOutputType = z.infer<typeof MemberPunchOutOutput>;
export type MessageAttachmentOutputType = z.infer<
  typeof MessageAttachmentOutput
>;
export type MessageOutputType = z.infer<typeof MessageOutput>;
export type MessageTypeType = z.infer<typeof MessageTypeSchema>;
export type MessageWithSenderType = z.infer<typeof MessageWithSenderSchema>;
export type MessagesListOutputType = z.infer<typeof MessagesListOutput>;
export type ModuleType = z.infer<typeof ModuleSchema>;
export type NotificationOutputType = z.infer<typeof NotificationOutput>;
export type NotificationStatusType = z.infer<typeof NotificationStatusSchema>;
export type NotificationTypeType = z.infer<typeof NotificationTypeSchema>;
export type PinMessageInputType = z.infer<typeof PinMessageInput>;
export type PinMessageOutputType = z.infer<typeof PinMessageOutput>;
export type RecentAttachmentOutputType = z.infer<typeof RecentAttachmentOutput>;
export type RecentAttachmentsListOutputType = z.infer<
  typeof RecentAttachmentsListOutput
>;
export type RemoveChannelMemberInputType = z.infer<
  typeof RemoveChannelMemberInput
>;
export type RemoveReactionInputType = z.infer<typeof RemoveReactionInput>;
export type RoleType = z.infer<typeof RoleSchema>;
export type SearchAttachmentsInputType = z.infer<typeof SearchAttachmentsInput>;
export type SearchMessageOutputType = z.infer<typeof SearchMessageOutput>;
export type SearchMessagesInputType = z.infer<typeof SearchMessagesInput>;
export type SearchMessagesListOutputType = z.infer<
  typeof SearchMessagesListOutput
>;
export type SearchUsersInputType = z.infer<typeof SearchUsersInput>;
export type SearchUsersOutputType = z.infer<typeof SearchUsersOutput>;
export type StorageStatsOutputType = z.infer<typeof StorageStatsOutput>;
export type SuccessOutputType = z.infer<typeof SuccessOutput>;
export type ThreadMessageOutputType = z.infer<typeof ThreadMessageOutput>;
export type UnPinMessageInputType = z.infer<typeof UnPinMessageInput>;
export type UnPinMessageOutputType = z.infer<typeof UnPinMessageOutput>;
export type UnreadCountOutputType = z.infer<typeof UnreadCountOutput>;
export type UpdateAttachmentInputType = z.infer<typeof UpdateAttachmentInput>;
export type UpdateChannelInputType = z.infer<typeof UpdateChannelInput>;
export type UpdateChannelMemberInputType = z.infer<
  typeof UpdateChannelMemberInput
>;
export type UpdateMessageInputType = z.infer<typeof UpdateMessageInput>;
export type UpdateMessageOutputType = z.infer<typeof UpdateMessageOutput>;
