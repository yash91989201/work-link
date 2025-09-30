import { z } from "zod";
import {
  ChannelInsertSchema,
  ChannelSchema,
  ChannelTypeSchema,
} from "./db-tables";

// Create channel input
export const CreateChannelInput = ChannelInsertSchema.extend({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  memberIds: z.array(z.string()).min(1, "At least one member is required"),
});

export const CreateChannelOutput = ChannelSchema;

// Update channel input
export const UpdateChannelInput = z.object({
  channelId: z.string(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isPrivate: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

// Get channel input
export const GetChannelInput = z.object({
  channelId: z.string(),
});

// Get channels input
export const GetChannelsInput = z.object({
  type: ChannelTypeSchema.optional(),
  teamId: z.string().optional(),
  includeArchived: z.boolean().default(false),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

export const ListChannelsInput = z.object({
  type: ChannelTypeSchema.optional(),
  teamId: z.string().optional(),
  includeArchived: z.boolean().default(false),
});

export const ListChannelsOutput = z.object({
  channels: z.array(ChannelSchema),
});

// Add channel member input
export const AddChannelMemberInput = z.object({
  channelId: z.string(),
  userId: z.string(),
  role: z.enum(["member", "admin", "moderator"]).default("member"),
});

// Remove channel member input
export const RemoveChannelMemberInput = z.object({
  channelId: z.string(),
  userId: z.string(),
});

// Update channel member input
export const UpdateChannelMemberInput = z.object({
  channelId: z.string(),
  userId: z.string(),
  role: z.enum(["member", "admin", "moderator"]).optional(),
  isMuted: z.boolean().optional(),
});

// Get channel members input
export const GetChannelMembersInput = z.object({
  channelId: z.string(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

// Join channel input
export const JoinChannelInput = z.object({
  channelId: z.string(),
});

// Leave channel input
export const LeaveChannelInput = z.object({
  channelId: z.string(),
});

// Archive channel input
export const ArchiveChannelInput = z.object({
  channelId: z.string(),
});

// Delete channel input
export const DeleteChannelInput = z.object({
  channelId: z.string(),
});

// Channel output schema
export const ChannelOutput = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  type: ChannelTypeSchema,
  organizationId: z.string(),
  teamId: z.string().nullable(),
  createdBy: z.string(),
  isPrivate: z.boolean(),
  isArchived: z.boolean(),
  lastMessageAt: z.date().nullable(),
  messageCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Channel with creator info
export const ChannelWithCreatorOutput = ChannelOutput.extend({
  creatorName: z.string().nullable(),
  creatorImage: z.string().nullable(),
});

// Channel member output schema
export const ChannelMemberOutput = z.object({
  id: z.string(),
  channelId: z.string(),
  userId: z.string(),
  role: z.string(),
  joinedAt: z.date(),
  lastReadAt: z.date().nullable(),
  isMuted: z.boolean(),
  userName: z.string().nullable(),
  userImage: z.string().nullable(),
  userEmail: z.string().nullable(),
});

// Channel with members count
export const ChannelWithStatsOutput = ChannelWithCreatorOutput.extend({
  memberCount: z.number(),
  unreadCount: z.number().optional(),
});

// Channels list output
export const ChannelsListOutput = z.object({
  channels: z.array(ChannelWithStatsOutput),
  total: z.number(),
  hasMore: z.boolean(),
});

// Channel members list output
export const ChannelMembersListOutput = z.object({
  members: z.array(ChannelMemberOutput),
  total: z.number(),
  hasMore: z.boolean(),
});

// Success response
export const SuccessOutput = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

// Export types
export type UpdateChannelInput = z.infer<typeof UpdateChannelInput>;
export type GetChannelInput = z.infer<typeof GetChannelInput>;
export type GetChannelsInput = z.infer<typeof GetChannelsInput>;
export type AddChannelMemberInput = z.infer<typeof AddChannelMemberInput>;
export type RemoveChannelMemberInput = z.infer<typeof RemoveChannelMemberInput>;
export type UpdateChannelMemberInput = z.infer<typeof UpdateChannelMemberInput>;
export type GetChannelMembersInput = z.infer<typeof GetChannelMembersInput>;
export type JoinChannelInput = z.infer<typeof JoinChannelInput>;
export type LeaveChannelInput = z.infer<typeof LeaveChannelInput>;
export type ArchiveChannelInput = z.infer<typeof ArchiveChannelInput>;
export type DeleteChannelInput = z.infer<typeof DeleteChannelInput>;
export type ChannelOutput = z.infer<typeof ChannelOutput>;
export type ChannelWithCreatorOutput = z.infer<typeof ChannelWithCreatorOutput>;
export type ChannelMemberOutput = z.infer<typeof ChannelMemberOutput>;
export type ChannelWithStatsOutput = z.infer<typeof ChannelWithStatsOutput>;
export type ChannelsListOutput = z.infer<typeof ChannelsListOutput>;
export type ChannelMembersListOutput = z.infer<typeof ChannelMembersListOutput>;
export type SuccessOutput = z.infer<typeof SuccessOutput>;
