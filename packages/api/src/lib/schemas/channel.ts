import {
  ChannelInsertSchema,
  ChannelJoinRequestSchema,
  ChannelSchema,
  ChannelTypeSchema,
  UserSchema,
} from "@work-link/db/lib/schemas/db-tables";
import { z } from "zod";

// Create channel input
export const CreateChannelInput = ChannelInsertSchema.extend({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  memberIds: z.array(z.string()).min(1, "At least one member is required"),
});

export const CreateChannelOutput = z.object({
  txid: z.number(),
  channel: ChannelSchema,
});

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

export const GetChannelOutput = ChannelSchema.extend({
  creator: UserSchema,
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
  channels: z.array(
    ChannelSchema.extend({
      creator: UserSchema,
    })
  ),
});

// Add channel member input
export const AddChannelMembersInput = z.object({
  channelId: z.string(),
  memberIds: z.array(z.string()),
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
export const ListChannelMembersInput = z.object({
  channelId: z.string(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

export const ListChannelMembersOutput = z.array(
  UserSchema.pick({
    id: true,
    name: true,
    email: true,
    image: true,
  }).extend({
    role: z.string(),
    joinedAt: z.date(),
  })
);
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

export const IsChannelMemberInput = z.object({
  channelId: z.string(),
});

export const IsChannelMemberOutput = z.boolean();

export const ChannelJoinRequestInput = z.object({
  channelId: z.string(),
  note: z.string().optional(),
});

export const ChannelJoinRequestOutput = ChannelJoinRequestSchema;

export const ListJoinRequestInput = z.object({
  channelId: z.string(),
});

export const ListJoinRequestOutput = z.array(
  ChannelJoinRequestSchema.extend({
    user: UserSchema,
  })
);
