import {
  AttachmentSchema,
  MessageSchema,
  UserSchema,
} from "@work-link/db/lib/schemas/db-tables";
import { z } from "zod";
import { SuccessOutput } from "./channel";

// Message types enum
export const MessageTypeSchema = MessageSchema.shape.type;

// Attachment input schema
export const AttachmentInput = z.object({
  fileName: z.string(),
  originalName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  type: z.enum(["image", "document", "video", "audio", "archive"]),
  url: z.string(),
});

// Create message input
export const CreateMessageInput = z
  .object({
    channelId: z.string(),
    receiverId: z.string().optional(),
    content: z.string().max(10_000).optional(),
    type: MessageTypeSchema.default("text"),
    parentMessageId: z.string().optional(),
    mentions: z.array(z.string()).optional(),
    attachments: z.array(AttachmentInput).optional(),
  })
  .refine((data) => data.channelId || data.receiverId, {
    message: "Either channelId or receiverId must be provided",
    path: ["channelId"],
  });

export const CreateMessageOutput = z.object({
  txid: z.number(),
  message: MessageSchema,
});

// Update message input
export const UpdateMessageInput = z.object({
  messageId: z.string(),
  content: z.string().max(10_000).optional(),
  mentions: z.array(z.string()).optional(),
});

export const UpdateMessageOutput = MessageSchema.extend({
  sender: UserSchema,
});

export const MessageWithSenderSchema = MessageSchema.extend({
  attachments: z.array(AttachmentSchema).optional(),
  sender: UserSchema,
});

export const GetChannelMessagesInput = z.object({
  channelId: z.string(),
});

export const GetChannelMessagesOutput = z.object({
  messages: z.array(MessageWithSenderSchema),
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

export const GetMessageOutput = MessageSchema.extend({
  sender: UserSchema.pick({
    name: true,
    email: true,
    image: true,
  }),
}).optional();

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
      name: z.string(),
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

export const SearchMessageOutput = z.object({
  messages: z.array(
    MessageSchema.extend({
      sender: z.object({
        name: z.string(),
        email: z.string(),
        image: z.string().optional().nullable(),
      }),
    })
  ),
  total: z.number(),
  hasMore: z.boolean(),
});

// Messages list output
export const MessagesListOutput = z.object({
  messages: z.array(MessageSchema),
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

export const GetPinnedMessagesInput = z.object({
  channelId: z.string(),
  query: z.string().optional(),
});

export const GetPinnedMessagesOutput = z.array(MessageWithSenderSchema);

export const GetMenionUsersInput = z.object({
  userIds: z.array(z.string()),
});

export const GetMenionUsersOutput = z.array(UserSchema);
