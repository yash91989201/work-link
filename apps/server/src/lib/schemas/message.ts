import { z } from "zod";
import { SuccessOutput } from "./channel";
import { MessageSchema, UserSchema } from "./db-tables";

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
  mentions: z.array(z.string()).optional(),
});

// Get channel messages input
export const GetChannelMessagesInput = z.object({
  channelId: z.string(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  beforeMessageId: z.string().optional(),
  afterMessageId: z.string().optional(),
  pinned: z.boolean().default(false).optional(),
});

export const GetChannelMessagesOutput = z.object({
  messages: z.array(
    MessageSchema.extend({
      sender: UserSchema.pick({
        name: true,
        email: true,
        image: true,
      }),
    })
  ),
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

// Search users for mentions input
export const SearchUsersInput = z.object({
  channelId: z.string(),
  query: z.string().max(50).default(""),
  limit: z.number().min(1).max(20).default(10),
});

// Search users for mentions output
export const SearchUsersOutput = z.object({
  users: z.array(
    z.object({
      id: z.string(),
      name: z.string().nullable(),
      email: z.string(),
      image: z.string().nullable(),
    })
  ),
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

export const PinMessageInput = z.object({
  messageId: z.string(),
});

export const PinMessageOutput = SuccessOutput;

export const UnPinMessageInput = z.object({
  messageId: z.string(),
});

export const UnPinMessageOutput = SuccessOutput;
