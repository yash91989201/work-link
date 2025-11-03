import { z } from "zod";

// Base attachment types
export const AttachmentTypeSchema = z.enum([
  "image",
  "document",
  "video",
  "audio",
  "archive",
  "other",
]);

// Input schemas
export const CreateAttachmentInput = z.object({
  messageId: z.string().min(1),
  fileName: z.string().min(1).max(255),
  originalName: z.string().min(1).max(255),
  fileSize: z
    .number()
    .min(1)
    .max(100 * 1024 * 1024), // 100MB max
  mimeType: z.string().min(1).max(255),
  type: AttachmentTypeSchema,
  supabaseStoragePath: z.string().min(1),
  supabaseBucket: z.string().min(1),
  thumbnailPath: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export const CreateBulkAttachmentsInput = z.object({
  attachments: z.array(CreateAttachmentInput).min(1).max(10),
});

export const GetAttachmentInput = z.object({
  attachmentId: z.string().min(1),
});

export const GetMessageAttachmentsInput = z.object({
  messageId: z.string().min(1),
});

export const GetMultipleMessageAttachmentsInput = z.object({
  messageIds: z.array(z.string().min(1)).min(1).max(50),
});

export const GetUserAttachmentsInput = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  type: AttachmentTypeSchema.optional(),
});

export const GetChannelAttachmentsInput = z.object({
  channelId: z.string().min(1),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  type: AttachmentTypeSchema.optional(),
});

export const SearchAttachmentsInput = z.object({
  query: z.string().min(1).max(255),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  type: AttachmentTypeSchema.optional(),
});

export const UpdateAttachmentInput = z.object({
  attachmentId: z.string().min(1),
  originalName: z.string().min(1).max(255).optional(),
  isPublic: z.boolean().optional(),
});

export const DeleteAttachmentInput = z.object({
  attachmentId: z.string().min(1),
});

export const GetStorageStatsInput = z.object({
  userId: z.string().min(1).optional(),
});

export const GetRecentAttachmentsInput = z.object({
  limit: z.number().min(1).max(50).default(10),
});

// Output schemas
export const AttachmentOutput = z.object({
  id: z.string(),
  messageId: z.string(),
  fileName: z.string(),
  originalName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  type: AttachmentTypeSchema,
  supabaseStoragePath: z.string(),
  supabaseBucket: z.string(),
  thumbnailPath: z.string().nullable(),
  uploadedBy: z.string(),
  uploaderName: z.string().nullable(),
  uploaderImage: z.string().nullable(),
  isPublic: z.boolean(),
  createdAt: z.date(),
});

export const AttachmentWithMessageOutput = AttachmentOutput.extend({
  messageContent: z.string().nullable(),
  senderId: z.string().nullable(),
  senderName: z.string().nullable(),
});

export const AttachmentWithChannelOutput = AttachmentOutput.extend({
  channelId: z.string().nullable(),
  channelName: z.string().nullable(),
});

export const AttachmentsListOutput = z.object({
  attachments: z.array(AttachmentOutput),
  total: z.number(),
  hasMore: z.boolean(),
});

export const AttachmentsWithChannelListOutput = z.object({
  attachments: z.array(AttachmentWithChannelOutput),
  total: z.number(),
  hasMore: z.boolean(),
});

export const AttachmentsWithMessageListOutput = z.object({
  attachments: z.array(AttachmentWithMessageOutput),
  total: z.number(),
  hasMore: z.boolean(),
});

export const StorageStatsOutput = z.object({
  totalFiles: z.number(),
  totalSize: z.number(),
  imageCount: z.number(),
  documentCount: z.number(),
  videoCount: z.number(),
  audioCount: z.number(),
  archiveCount: z.number(),
  otherCount: z.number(),
});

export const RecentAttachmentOutput = z.object({
  id: z.string(),
  fileName: z.string(),
  originalName: z.string(),
  type: AttachmentTypeSchema,
  fileSize: z.number(),
  thumbnailPath: z.string().nullable(),
  createdAt: z.date(),
  channelName: z.string().nullable(),
});

export const RecentAttachmentsListOutput = z.object({
  attachments: z.array(RecentAttachmentOutput),
});

export const DeleteAttachmentOutput = z.object({
  success: z.boolean(),
  deletedAttachment: AttachmentOutput,
});
