import { z } from "zod";

// Enums and base types
export const userStatusSchema = z.enum(["online", "offline", "away", "busy"]);

// Input schemas
export const updatePresenceSchema = z.object({
  status: userStatusSchema,
  currentChannelId: z.string().optional(),
  customStatus: z.string().max(100).optional(),
  statusEmoji: z.string().max(10).optional(),
});

export const updateLastSeenSchema = z.object({
  channelId: z.string().optional(),
});

export const setStatusSchema = z.object({
  status: userStatusSchema,
  customStatus: z.string().max(100).optional(),
});

export const updateCustomStatusSchema = z.object({
  customStatus: z.string().max(100).optional(),
  statusEmoji: z.string().max(10).optional(),
});

export const getUserPresenceSchema = z.object({
  userId: z.string(),
});

export const getMultipleUserPresenceSchema = z.object({
  userIds: z.array(z.string()).min(1).max(100),
});

export const getChannelOnlineUsersSchema = z.object({
  channelId: z.string(),
});

export const getUsersInChannelSchema = z.object({
  channelId: z.string(),
});

export const getOrganizationOnlineUsersSchema = z.object({
  organizationId: z.string(),
});

export const getOrganizationPresenceStatsSchema = z.object({
  organizationId: z.string(),
});

export const bulkUpdatePresenceSchema = z.object({
  presenceUpdates: z
    .array(
      z.object({
        userId: z.string(),
        status: userStatusSchema,
        currentChannelId: z.string().optional(),
        customStatus: z.string().max(100).optional(),
        statusEmoji: z.string().max(10).optional(),
      })
    )
    .min(1)
    .max(50),
});

export const getUserPresenceHistorySchema = z.object({
  userId: z.string(),
  days: z.number().min(1).max(30).optional().default(7),
  limit: z.number().min(1).max(1000).optional().default(100),
});

export const setTypingSchema = z.object({
  channelId: z.string(),
  isTyping: z.boolean().optional().default(true),
});

// Output schemas
export const userPresenceInfoSchema = z.object({
  userId: z.string(),
  status: userStatusSchema,
  lastSeen: z.date(),
  currentChannelId: z.string().nullable(),
  customStatus: z.string().nullable(),
  statusEmoji: z.string().nullable(),
  userName: z.string(),
  userImage: z.string().nullable(),
  isOnline: z.boolean(),
});

export const presenceStatsSchema = z.object({
  totalUsers: z.number(),
  onlineUsers: z.number(),
  awayUsers: z.number(),
  busyUsers: z.number(),
  offlineUsers: z.number(),
});

export const presenceUpdateResultSchema = z.object({
  id: z.string(),
  status: userStatusSchema,
  lastSeen: z.date(),
  currentChannelId: z.string().nullable(),
  customStatus: z.string().nullable(),
  statusEmoji: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Type exports
export type UpdatePresenceInput = z.infer<typeof updatePresenceSchema>;
export type UpdateLastSeenInput = z.infer<typeof updateLastSeenSchema>;
export type SetStatusInput = z.infer<typeof setStatusSchema>;
export type UpdateCustomStatusInput = z.infer<typeof updateCustomStatusSchema>;
export type GetUserPresenceInput = z.infer<typeof getUserPresenceSchema>;
export type GetMultipleUserPresenceInput = z.infer<
  typeof getMultipleUserPresenceSchema
>;
export type GetChannelOnlineUsersInput = z.infer<
  typeof getChannelOnlineUsersSchema
>;
export type GetUsersInChannelInput = z.infer<typeof getUsersInChannelSchema>;
export type GetOrganizationOnlineUsersInput = z.infer<
  typeof getOrganizationOnlineUsersSchema
>;
export type GetOrganizationPresenceStatsInput = z.infer<
  typeof getOrganizationPresenceStatsSchema
>;
export type BulkUpdatePresenceInput = z.infer<typeof bulkUpdatePresenceSchema>;
export type GetUserPresenceHistoryInput = z.infer<
  typeof getUserPresenceHistorySchema
>;
export type SetTypingInput = z.infer<typeof setTypingSchema>;
export type UserPresenceInfo = z.infer<typeof userPresenceInfoSchema>;
export type PresenceStats = z.infer<typeof presenceStatsSchema>;
export type PresenceUpdateResult = z.infer<typeof presenceUpdateResultSchema>;
