import { z } from "zod";
import { MessageSchema } from "./db-tables";

// Message types enum
export const MessageTypeSchema = z.enum([
  "text",
  "file",
  "image",
  "system",
  "reply",
]);

// Create message input
export const CreateMessageInput = z
  .object({
    channelId: z.string().optional(),
    receiverId: z.string().optional(),
    content: z.string().max(10_000).optional(),
    type: MessageTypeSchema.default("text"),
    parentMessageId: z.string().optional(),
    mentions: z.array(z.string()).optional(),
  })
  .refine((data) => data.channelId || data.receiverId, {
    message: "Either channelId or receiverId must be provided",
    path: ["channelId"],
  });

// Update message input
export const UpdateMessageInput = z.object({
  messageId: z.string(),
  content: z.string().max(10_000).optional(),
});

// Get channel messages input
export const GetChannelMessagesInput = z.object({
  channelId: z.string(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  beforeMessageId: z.string().optional(),
  afterMessageId: z.string().optional(),
});

export const GetChannelMessagesOutput = z.object({
  messages: z.array(MessageSchema),
});

// Get direct messages input
export const GetDirectMessagesInput = z.object({
  userId1: z.string(),
  userId2: z.string(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

// Get thread messages input
export const GetThreadMessagesInput = z.object({
  parentMessageId: z.string(),
  limit: z.number().min(1).max(50).default(20),
});

// Delete message input
export const DeleteMessageInput = z.object({
  messageId: z.string(),
});

// Add reaction input
export const AddReactionInput = z.object({
  messageId: z.string(),
  emoji: z.string().min(1).max(10),
});

// Remove reaction input
export const RemoveReactionInput = z.object({
  messageId: z.string(),
  emoji: z.string().min(1).max(10),
});

// Mark message as read input
export const MarkMessageAsReadInput = z.object({
  messageId: z.string(),
});

// Get unread count input
export const GetUnreadCountInput = z.object({
  channelId: z.string(),
});

// Search messages input
export const SearchMessagesInput = z.object({
  channelId: z.string(),
  query: z.string().min(1).max(100),
  limit: z.number().min(1).max(50).default(20),
  offset: z.number().min(0).default(0),
});

// Get message input
export const GetMessageInput = z.object({
  messageId: z.string(),
});

// Message attachment output schema
export const MessageAttachmentOutput = z.object({
  id: z.string(),
  messageId: z.string(),
  fileName: z.string(),
  originalName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  type: z.string(),
  supabaseStoragePath: z.string(),
  supabaseBucket: z.string(),
  thumbnailPath: z.string().nullable(),
  uploadedBy: z.string(),
  createdAt: z.date(),
});

// Message output schema
export const MessageOutput = z.object({
  id: z.string(),
  channelId: z.string().nullable(),
  senderId: z.string(),
  receiverId: z.string().nullable(),
  content: z.string().nullable(),
  type: MessageTypeSchema,
  parentMessageId: z.string().nullable(),
  threadCount: z.number(),
  isEdited: z.boolean(),
  editedAt: z.date().nullable(),
  mentions: z.array(z.string()).nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Message with sender info output schema
export const MessageWithSenderOutput = MessageOutput.extend({
  senderName: z.string().nullable(),
  senderEmail: z.string().nullable(),
  senderImage: z.string().nullable(),
  attachments: z.array(MessageAttachmentOutput).optional(),
});

// Thread message output (simplified for thread display)
export const ThreadMessageOutput = z.object({
  id: z.string(),
  content: z.string().nullable(),
  type: MessageTypeSchema,
  isEdited: z.boolean(),
  editedAt: z.date().nullable(),
  mentions: z.array(z.string()).nullable(),
  createdAt: z.date(),
  senderId: z.string(),
  senderName: z.string().nullable(),
  senderEmail: z.string().nullable(),
  senderImage: z.string().nullable(),
  attachments: z.array(MessageAttachmentOutput).optional(),
});

// Search result output schema
export const SearchMessageOutput = z.object({
  id: z.string(),
  content: z.string().nullable(),
  type: MessageTypeSchema,
  createdAt: z.date(),
  senderId: z.string(),
  senderName: z.string().nullable(),
  senderImage: z.string().nullable(),
  mentions: z.array(z.string()).nullable(),
  attachments: z.array(MessageAttachmentOutput).optional(),
});

// Messages list output
export const MessagesListOutput = z.object({
  messages: z.array(MessageSchema),
});

// Thread messages list output
export const ThreadMessagesListOutput = z.object({
  messages: z.array(ThreadMessageOutput),
  parentMessage: MessageWithSenderOutput.optional(),
});

// Search messages list output
export const SearchMessagesListOutput = z.object({
  messages: z.array(SearchMessageOutput),
  total: z.number(),
  hasMore: z.boolean(),
});

// Unread count output
export const UnreadCountOutput = z.object({
  count: z.number(),
});

// Success response
export const SuccessOutput = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

// Export types
export type CreateMessageInput = z.infer<typeof CreateMessageInput>;
export type UpdateMessageInput = z.infer<typeof UpdateMessageInput>;
export type GetChannelMessagesInput = z.infer<typeof GetChannelMessagesInput>;
export type GetDirectMessagesInput = z.infer<typeof GetDirectMessagesInput>;
export type GetThreadMessagesInput = z.infer<typeof GetThreadMessagesInput>;
export type DeleteMessageInput = z.infer<typeof DeleteMessageInput>;
export type AddReactionInput = z.infer<typeof AddReactionInput>;
export type RemoveReactionInput = z.infer<typeof RemoveReactionInput>;
export type MarkMessageAsReadInput = z.infer<typeof MarkMessageAsReadInput>;
export type GetUnreadCountInput = z.infer<typeof GetUnreadCountInput>;
export type SearchMessagesInput = z.infer<typeof SearchMessagesInput>;
export type GetMessageInput = z.infer<typeof GetMessageInput>;
export type MessageAttachmentOutput = z.infer<typeof MessageAttachmentOutput>;
export type MessageOutput = z.infer<typeof MessageOutput>;
export type MessageWithSenderOutput = z.infer<typeof MessageWithSenderOutput>;
export type ThreadMessageOutput = z.infer<typeof ThreadMessageOutput>;
export type SearchMessageOutput = z.infer<typeof SearchMessageOutput>;
export type MessagesListOutput = z.infer<typeof MessagesListOutput>;
export type ThreadMessagesListOutput = z.infer<typeof ThreadMessagesListOutput>;
export type SearchMessagesListOutput = z.infer<typeof SearchMessagesListOutput>;
export type UnreadCountOutput = z.infer<typeof UnreadCountOutput>;
export type SuccessOutput = z.infer<typeof SuccessOutput>;
