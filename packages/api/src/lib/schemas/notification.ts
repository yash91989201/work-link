import { z } from "zod";

// Base notification types
export const NotificationTypeSchema = z.enum([
  "message",
  "mention",
  "channel_invite",
  "direct_message",
  "announcement",
  "system",
]);

export const NotificationStatusSchema = z.enum(["unread", "read", "dismissed"]);

// Input schemas
export const GetNotificationsInput = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  status: NotificationStatusSchema.optional(),
  type: NotificationTypeSchema.optional(),
});

export const MarkNotificationAsReadInput = z.object({
  notificationId: z.string().min(1),
});

export const MarkMultipleAsReadInput = z.object({
  notificationIds: z.array(z.string().min(1)).min(1).max(100),
});

export const DismissNotificationInput = z.object({
  notificationId: z.string().min(1),
});

export const DeleteNotificationInput = z.object({
  notificationId: z.string().min(1),
});

export const CreateNotificationInput = z.object({
  userId: z.string().min(1),
  type: NotificationTypeSchema,
  title: z.string().min(1).max(255),
  message: z.string().max(1000).optional(),
  entityId: z.string().optional(),
  entityType: z.string().optional(),
  actionUrl: z.url().optional(),
});

export const CreateBulkNotificationsInput = z.object({
  notifications: z.array(CreateNotificationInput).min(1).max(100),
});

export const CreateChannelInviteNotificationInput = z.object({
  channelId: z.string().min(1),
  invitedUserId: z.string().min(1),
});

export const CreateSystemNotificationInput = z.object({
  userIds: z.array(z.string().min(1)).min(1).max(1000),
  title: z.string().min(1).max(255),
  message: z.string().max(1000).optional(),
  actionUrl: z.url().optional(),
});

export const CreateAnnouncementNotificationInput = z.object({
  title: z.string().min(1).max(255),
  message: z.string().min(1).max(1000),
  actionUrl: z.url().optional(),
});

// Output schemas
export const NotificationOutput = z.object({
  id: z.string(),
  type: NotificationTypeSchema,
  status: NotificationStatusSchema,
  title: z.string(),
  message: z.string().nullable(),
  entityId: z.string().nullable(),
  entityType: z.string().nullable(),
  actionUrl: z.string().nullable(),
  readAt: z.date().nullable(),
  dismissedAt: z.date().nullable(),
  createdAt: z.date(),
});

export const NotificationsListOutput = z.object({
  notifications: z.array(NotificationOutput),
  total: z.number(),
  hasMore: z.boolean(),
});
