import { ORPCError } from "@orpc/server";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { user as userTable } from "@/db/schema/auth";
import {
  attachmentTable,
  channelMemberTable,
  channelTable,
  messageTable,
} from "@/db/schema/communication";
import { protectedProcedure } from "@/lib/orpc";
import {
  AttachmentOutput,
  AttachmentsListOutput,
  AttachmentsWithChannelListOutput,
  AttachmentsWithMessageListOutput,
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
  RecentAttachmentsListOutput,
  SearchAttachmentsInput,
  StorageStatsOutput,
  UpdateAttachmentInput,
} from "@/lib/schemas/attachment";
import { SuccessOutput } from "@/lib/schemas/channel";

const toMetadata = (value: unknown) => {
  if (value == null || typeof value !== "object") {
    return null;
  }
  return value as Record<string, unknown>;
};

type AttachmentInsert = typeof attachmentTable.$inferInsert;

export const attachmentsRouter = {
  // Create a single attachment
  create: protectedProcedure
    .input(CreateAttachmentInput)
    .output(AttachmentOutput)
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const currentUser = session.user;

      const [attachment] = await db
        .insert(attachmentTable)
        .values({
          messageId: input.messageId,
          fileName: input.fileName,
          originalName: input.originalName,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          type: input.type as AttachmentInsert["type"],
          supabaseStoragePath: input.supabaseStoragePath,
          supabaseBucket: input.supabaseBucket,
          thumbnailPath: input.thumbnailPath ?? null,
          uploadedBy: currentUser.id,
          isPublic: input.isPublic ?? false,
        })
        .returning();

      return AttachmentOutput.parse({
        ...attachment,
        uploaderName: null,
        uploaderImage: null,
        metadata: toMetadata(attachment.metadata),
      });
    }),

  // Create multiple attachments (bulk operation)
  createBulk: protectedProcedure
    .input(CreateBulkAttachmentsInput)
    .output(SuccessOutput)
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const currentUser = session.user;

      const attachmentData = input.attachments.map((attachment) => ({
        messageId: attachment.messageId,
        fileName: attachment.fileName,
        originalName: attachment.originalName,
        fileSize: attachment.fileSize,
        mimeType: attachment.mimeType,
        type: attachment.type as AttachmentInsert["type"],
        supabaseStoragePath: attachment.supabaseStoragePath,
        supabaseBucket: attachment.supabaseBucket,
        thumbnailPath: attachment.thumbnailPath ?? null,
        uploadedBy: currentUser.id,
        isPublic: attachment.isPublic ?? false,
      }));

      if (attachmentData.length > 0) {
        await db.insert(attachmentTable).values(attachmentData).returning();
      }

      return {
        success: true,
        message: `Created ${input.attachments.length} attachments successfully.`,
      };
    }),

  // Get attachment by ID
  get: protectedProcedure
    .input(GetAttachmentInput)
    .output(AttachmentOutput.nullable())
    .handler(async ({ input, context }) => {
      const { db } = context;

      const [attachment] = await db
        .select({
          id: attachmentTable.id,
          messageId: attachmentTable.messageId,
          fileName: attachmentTable.fileName,
          originalName: attachmentTable.originalName,
          fileSize: attachmentTable.fileSize,
          mimeType: attachmentTable.mimeType,
          type: attachmentTable.type,
          supabaseStoragePath: attachmentTable.supabaseStoragePath,
          supabaseBucket: attachmentTable.supabaseBucket,
          thumbnailPath: attachmentTable.thumbnailPath,
          uploadedBy: attachmentTable.uploadedBy,
          uploaderName: userTable.name,
          uploaderImage: userTable.image,
          isPublic: attachmentTable.isPublic,
          metadata: attachmentTable.metadata,
          createdAt: attachmentTable.createdAt,
        })
        .from(attachmentTable)
        .leftJoin(userTable, eq(userTable.id, attachmentTable.uploadedBy))
        .where(eq(attachmentTable.id, input.attachmentId))
        .limit(1);

      if (!attachment) {
        return null;
      }

      return AttachmentOutput.parse({
        ...attachment,
        metadata: toMetadata(attachment.metadata),
      });
    }),

  // Get attachments for a message
  getMessageAttachments: protectedProcedure
    .input(GetMessageAttachmentsInput)
    .output(AttachmentsListOutput)
    .handler(async ({ input, context }) => {
      const { db } = context;

      const attachments = await db
        .select({
          id: attachmentTable.id,
          messageId: attachmentTable.messageId,
          fileName: attachmentTable.fileName,
          originalName: attachmentTable.originalName,
          fileSize: attachmentTable.fileSize,
          mimeType: attachmentTable.mimeType,
          type: attachmentTable.type,
          supabaseStoragePath: attachmentTable.supabaseStoragePath,
          supabaseBucket: attachmentTable.supabaseBucket,
          thumbnailPath: attachmentTable.thumbnailPath,
          uploadedBy: attachmentTable.uploadedBy,
          uploaderName: userTable.name,
          uploaderImage: userTable.image,
          isPublic: attachmentTable.isPublic,
          metadata: attachmentTable.metadata,
          createdAt: attachmentTable.createdAt,
        })
        .from(attachmentTable)
        .leftJoin(userTable, eq(userTable.id, attachmentTable.uploadedBy))
        .where(eq(attachmentTable.messageId, input.messageId))
        .orderBy(desc(attachmentTable.createdAt));

      const formattedAttachments = attachments.map((attachment) =>
        AttachmentOutput.parse({
          ...attachment,
          metadata: toMetadata(attachment.metadata),
        })
      );

      return {
        attachments: formattedAttachments,
        total: formattedAttachments.length,
        hasMore: false,
      };
    }),

  // Get attachments for multiple messages
  getMultipleMessageAttachments: protectedProcedure
    .input(GetMultipleMessageAttachmentsInput)
    .output(AttachmentsListOutput)
    .handler(async ({ input, context }) => {
      const { db } = context;

      if (input.messageIds.length === 0) {
        return {
          attachments: [],
          total: 0,
          hasMore: false,
        };
      }

      const attachments = await db
        .select({
          id: attachmentTable.id,
          messageId: attachmentTable.messageId,
          fileName: attachmentTable.fileName,
          originalName: attachmentTable.originalName,
          fileSize: attachmentTable.fileSize,
          mimeType: attachmentTable.mimeType,
          type: attachmentTable.type,
          supabaseStoragePath: attachmentTable.supabaseStoragePath,
          supabaseBucket: attachmentTable.supabaseBucket,
          thumbnailPath: attachmentTable.thumbnailPath,
          uploadedBy: attachmentTable.uploadedBy,
          uploaderName: userTable.name,
          uploaderImage: userTable.image,
          isPublic: attachmentTable.isPublic,
          metadata: attachmentTable.metadata,
          createdAt: attachmentTable.createdAt,
        })
        .from(attachmentTable)
        .leftJoin(userTable, eq(userTable.id, attachmentTable.uploadedBy))
        .where(inArray(attachmentTable.messageId, input.messageIds))
        .orderBy(desc(attachmentTable.createdAt));

      const formattedAttachments = attachments.map((attachment) =>
        AttachmentOutput.parse({
          ...attachment,
          metadata: toMetadata(attachment.metadata),
        })
      );

      return {
        attachments: formattedAttachments,
        total: formattedAttachments.length,
        hasMore: false,
      };
    }),

  // Get user's attachments
  getUserAttachments: protectedProcedure
    .input(GetUserAttachmentsInput)
    .output(AttachmentsWithChannelListOutput)
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const currentUser = session.user;
      const orgId = session.session.activeOrganizationId;

      if (!orgId) {
        throw new ORPCError("NOT_FOUND", {
          message: "Organization not found.",
        });
      }

      let paginatedQuery = db
        .select({
          id: attachmentTable.id,
          messageId: attachmentTable.messageId,
          fileName: attachmentTable.fileName,
          originalName: attachmentTable.originalName,
          fileSize: attachmentTable.fileSize,
          mimeType: attachmentTable.mimeType,
          type: attachmentTable.type,
          supabaseStoragePath: attachmentTable.supabaseStoragePath,
          supabaseBucket: attachmentTable.supabaseBucket,
          thumbnailPath: attachmentTable.thumbnailPath,
          uploadedBy: attachmentTable.uploadedBy,
          uploaderName: userTable.name,
          uploaderImage: userTable.image,
          isPublic: attachmentTable.isPublic,
          metadata: attachmentTable.metadata,
          createdAt: attachmentTable.createdAt,
          channelId: messageTable.channelId,
          channelName: channelTable.name,
        })
        .from(attachmentTable)
        .leftJoin(userTable, eq(userTable.id, attachmentTable.uploadedBy))
        .leftJoin(messageTable, eq(messageTable.id, attachmentTable.messageId))
        .leftJoin(channelTable, eq(channelTable.id, messageTable.channelId))
        .where(eq(attachmentTable.uploadedBy, currentUser.id))
        // .where(eq(channelTable.organizationId, orgId))
        .orderBy(desc(attachmentTable.createdAt))
        .limit(input.limit)
        .offset(input.offset)
        .$dynamic();

      if (input.type) {
        paginatedQuery = paginatedQuery.where(
          eq(attachmentTable.type, input.type as AttachmentInsert["type"])
        );
      }

      const attachments = await paginatedQuery;

      let countQuery = db
        .select({ total: sql<number>`COUNT(*)` })
        .from(attachmentTable)
        .leftJoin(messageTable, eq(messageTable.id, attachmentTable.messageId))
        .leftJoin(channelTable, eq(channelTable.id, messageTable.channelId))
        .where(eq(attachmentTable.uploadedBy, currentUser.id))
        // .where(eq(channelTable.organizationId, orgId))
        .$dynamic();

      if (input.type) {
        countQuery = countQuery.where(
          eq(attachmentTable.type, input.type as AttachmentInsert["type"])
        );
      }

      const [countResult] = await countQuery;
      const total = countResult?.total ?? 0;
      const hasMore = input.offset + attachments.length < total;

      const formattedAttachments = attachments.map((attachment) => ({
        id: attachment.id,
        messageId: attachment.messageId,
        fileName: attachment.fileName,
        originalName: attachment.originalName,
        fileSize: attachment.fileSize,
        mimeType: attachment.mimeType,
        type: attachment.type,
        supabaseStoragePath: attachment.supabaseStoragePath,
        supabaseBucket: attachment.supabaseBucket,
        thumbnailPath: attachment.thumbnailPath,
        uploadedBy: attachment.uploadedBy,
        uploaderName: attachment.uploaderName,
        uploaderImage: attachment.uploaderImage,
        isPublic: attachment.isPublic,
        metadata: toMetadata(attachment.metadata),
        createdAt: attachment.createdAt,
        channelId: attachment.channelId,
        channelName: attachment.channelName,
      }));

      return {
        attachments: formattedAttachments,
        total,
        hasMore,
      };
    }),

  // Get channel attachments
  getChannelAttachments: protectedProcedure
    .input(GetChannelAttachmentsInput)
    .output(AttachmentsWithMessageListOutput)
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const currentUser = session.user;

      const [channel] = await db
        .select({
          id: channelTable.id,
          isPrivate: channelTable.isPrivate,
        })
        .from(channelTable)
        .where(eq(channelTable.id, input.channelId))
        .limit(1);

      if (!channel) {
        throw new ORPCError("NOT_FOUND", {
          message: "Channel not found.",
        });
      }

      if (channel.isPrivate) {
        const [membership] = await db
          .select({ id: channelMemberTable.id })
          .from(channelMemberTable)
          .where(
            and(
              eq(channelMemberTable.channelId, input.channelId),
              eq(channelMemberTable.userId, currentUser.id)
            )
          )
          .limit(1);

        if (!membership) {
          throw new ORPCError("FORBIDDEN", {
            message: "You don't have access to this channel.",
          });
        }
      }

      let paginatedQuery = db
        .select({
          id: attachmentTable.id,
          messageId: attachmentTable.messageId,
          fileName: attachmentTable.fileName,
          originalName: attachmentTable.originalName,
          fileSize: attachmentTable.fileSize,
          mimeType: attachmentTable.mimeType,
          type: attachmentTable.type,
          supabaseStoragePath: attachmentTable.supabaseStoragePath,
          supabaseBucket: attachmentTable.supabaseBucket,
          thumbnailPath: attachmentTable.thumbnailPath,
          uploadedBy: attachmentTable.uploadedBy,
          uploaderName: userTable.name,
          uploaderImage: userTable.image,
          isPublic: attachmentTable.isPublic,
          metadata: attachmentTable.metadata,
          createdAt: attachmentTable.createdAt,
          messageContent: messageTable.content,
          senderId: messageTable.senderId,
          senderName: sql<string>`sender.name`,
        })
        .from(attachmentTable)
        .leftJoin(userTable, eq(userTable.id, attachmentTable.uploadedBy))
        .leftJoin(messageTable, eq(messageTable.id, attachmentTable.messageId))
        .leftJoin(
          sql`${userTable} AS sender`,
          eq(sql`sender.id`, messageTable.senderId)
        )
        .where(eq(messageTable.channelId, input.channelId))
        .orderBy(desc(attachmentTable.createdAt))
        .limit(input.limit)
        .offset(input.offset)
        .$dynamic();

      if (input.type) {
        paginatedQuery = paginatedQuery.where(
          eq(attachmentTable.type, input.type as AttachmentInsert["type"])
        );
      }

      const attachments = await paginatedQuery;

      let countQuery = db
        .select({ total: sql<number>`COUNT(*)` })
        .from(attachmentTable)
        .leftJoin(messageTable, eq(messageTable.id, attachmentTable.messageId))
        .where(eq(messageTable.channelId, input.channelId))
        .$dynamic();

      if (input.type) {
        countQuery = countQuery.where(
          eq(attachmentTable.type, input.type as AttachmentInsert["type"])
        );
      }

      const [countResult] = await countQuery;
      const total = countResult?.total ?? 0;
      const hasMore = input.offset + attachments.length < total;

      const formattedAttachments = attachments.map((attachment) => ({
        id: attachment.id,
        messageId: attachment.messageId,
        fileName: attachment.fileName,
        originalName: attachment.originalName,
        fileSize: attachment.fileSize,
        mimeType: attachment.mimeType,
        type: attachment.type,
        supabaseStoragePath: attachment.supabaseStoragePath,
        supabaseBucket: attachment.supabaseBucket,
        thumbnailPath: attachment.thumbnailPath,
        uploadedBy: attachment.uploadedBy,
        uploaderName: attachment.uploaderName,
        uploaderImage: attachment.uploaderImage,
        isPublic: attachment.isPublic,
        metadata: toMetadata(attachment.metadata),
        createdAt: attachment.createdAt,
        messageContent: attachment.messageContent,
        senderId: attachment.senderId,
        senderName: attachment.senderName,
      }));

      return {
        attachments: formattedAttachments,
        total,
        hasMore,
      };
    }),

  // Search attachments
  search: protectedProcedure
    .input(SearchAttachmentsInput)
    .output(AttachmentsWithChannelListOutput)
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const orgId = session.session.activeOrganizationId;

      if (!orgId) {
        throw new ORPCError("NOT_FOUND", {
          message: "Organization not found.",
        });
      }

      let paginatedQuery = db
        .select({
          id: attachmentTable.id,
          messageId: attachmentTable.messageId,
          fileName: attachmentTable.fileName,
          originalName: attachmentTable.originalName,
          fileSize: attachmentTable.fileSize,
          mimeType: attachmentTable.mimeType,
          type: attachmentTable.type,
          supabaseStoragePath: attachmentTable.supabaseStoragePath,
          supabaseBucket: attachmentTable.supabaseBucket,
          thumbnailPath: attachmentTable.thumbnailPath,
          uploadedBy: attachmentTable.uploadedBy,
          uploaderName: userTable.name,
          uploaderImage: userTable.image,
          isPublic: attachmentTable.isPublic,
          metadata: attachmentTable.metadata,
          createdAt: attachmentTable.createdAt,
          channelId: messageTable.channelId,
          channelName: channelTable.name,
        })
        .from(attachmentTable)
        .leftJoin(userTable, eq(userTable.id, attachmentTable.uploadedBy))
        .leftJoin(messageTable, eq(messageTable.id, attachmentTable.messageId))
        .leftJoin(channelTable, eq(channelTable.id, messageTable.channelId))
        .where(sql`${attachmentTable.originalName} ILIKE ${`%${input.query}%`}`)
        // .where(eq(channelTable.organizationId, orgId))
        .orderBy(desc(attachmentTable.createdAt))
        .limit(input.limit)
        .offset(input.offset)
        .$dynamic();

      if (input.type) {
        paginatedQuery = paginatedQuery.where(
          eq(attachmentTable.type, input.type as AttachmentInsert["type"])
        );
      }

      const attachments = await paginatedQuery;

      let countQuery = db
        .select({ total: sql<number>`COUNT(*)` })
        .from(attachmentTable)
        .leftJoin(messageTable, eq(messageTable.id, attachmentTable.messageId))
        .leftJoin(channelTable, eq(channelTable.id, messageTable.channelId))
        .where(sql`${attachmentTable.originalName} ILIKE ${`%${input.query}%`}`)
        // .where(eq(channelTable.organizationId, orgId))
        .$dynamic();

      if (input.type) {
        countQuery = countQuery.where(
          eq(attachmentTable.type, input.type as AttachmentInsert["type"])
        );
      }

      const [countResult] = await countQuery;
      const total = countResult?.total ?? 0;
      const hasMore = input.offset + attachments.length < total;

      const formattedAttachments = attachments.map((attachment) => ({
        id: attachment.id,
        messageId: attachment.messageId,
        fileName: attachment.fileName,
        originalName: attachment.originalName,
        fileSize: attachment.fileSize,
        mimeType: attachment.mimeType,
        type: attachment.type,
        supabaseStoragePath: attachment.supabaseStoragePath,
        supabaseBucket: attachment.supabaseBucket,
        thumbnailPath: attachment.thumbnailPath,
        uploadedBy: attachment.uploadedBy,
        uploaderName: attachment.uploaderName,
        uploaderImage: attachment.uploaderImage,
        isPublic: attachment.isPublic,
        metadata: toMetadata(attachment.metadata),
        createdAt: attachment.createdAt,
        channelId: attachment.channelId,
        channelName: attachment.channelName,
      }));

      return {
        attachments: formattedAttachments,
        total,
        hasMore,
      };
    }),

  // Update attachment
  update: protectedProcedure
    .input(UpdateAttachmentInput)
    .output(AttachmentOutput)
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const currentUser = session.user;

      const [existing] = await db
        .select({
          id: attachmentTable.id,
          uploadedBy: attachmentTable.uploadedBy,
        })
        .from(attachmentTable)
        .where(eq(attachmentTable.id, input.attachmentId))
        .limit(1);

      if (!existing) {
        throw new ORPCError("NOT_FOUND", {
          message: "Attachment not found.",
        });
      }

      if (existing.uploadedBy !== currentUser.id) {
        throw new ORPCError("FORBIDDEN", {
          message: "You can only update your own attachments.",
        });
      }

      const updates: Partial<AttachmentInsert> = {};

      if (input.originalName !== undefined) {
        updates.originalName = input.originalName;
      }

      if (input.isPublic !== undefined) {
        updates.isPublic = input.isPublic;
      }

      if (Object.keys(updates).length === 0) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No update fields provided.",
        });
      }

      const [updated] = await db
        .update(attachmentTable)
        .set(updates)
        .where(eq(attachmentTable.id, input.attachmentId))
        .returning();

      return AttachmentOutput.parse({
        ...updated,
        uploaderName: null,
        uploaderImage: null,
        metadata: toMetadata(updated.metadata),
      });
    }),

  // Delete attachment
  delete: protectedProcedure
    .input(DeleteAttachmentInput)
    .output(DeleteAttachmentOutput)
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const currentUser = session.user;

      const [attachment] = await db
        .select({
          id: attachmentTable.id,
          messageId: attachmentTable.messageId,
          fileName: attachmentTable.fileName,
          originalName: attachmentTable.originalName,
          fileSize: attachmentTable.fileSize,
          mimeType: attachmentTable.mimeType,
          type: attachmentTable.type,
          supabaseStoragePath: attachmentTable.supabaseStoragePath,
          supabaseBucket: attachmentTable.supabaseBucket,
          thumbnailPath: attachmentTable.thumbnailPath,
          uploadedBy: attachmentTable.uploadedBy,
          uploaderName: userTable.name,
          uploaderImage: userTable.image,
          isPublic: attachmentTable.isPublic,
          metadata: attachmentTable.metadata,
          createdAt: attachmentTable.createdAt,
        })
        .from(attachmentTable)
        .leftJoin(userTable, eq(userTable.id, attachmentTable.uploadedBy))
        .where(eq(attachmentTable.id, input.attachmentId))
        .limit(1);

      if (!attachment) {
        throw new ORPCError("NOT_FOUND", {
          message: "Attachment not found.",
        });
      }

      if (attachment.uploadedBy !== currentUser.id) {
        throw new ORPCError("FORBIDDEN", {
          message: "You can only delete your own attachments.",
        });
      }

      await db
        .delete(attachmentTable)
        .where(eq(attachmentTable.id, input.attachmentId));

      return {
        success: true,
        deletedAttachment: {
          ...attachment,
          metadata: toMetadata(attachment.metadata),
        },
      };
    }),

  // Get storage statistics
  getStorageStats: protectedProcedure
    .input(GetStorageStatsInput)
    .output(StorageStatsOutput)
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const currentUser = session.user;
      const orgId = session.session.activeOrganizationId ?? "";

      const targetUserId = input.userId ?? currentUser.id;

      let query = db
        .select({
          totalFiles: sql<number>`COUNT(*)::INTEGER`,
          totalSize: sql<number>`COALESCE(SUM(${attachmentTable.fileSize}), 0)::INTEGER`,
          imageCount: sql<number>`COUNT(CASE WHEN ${attachmentTable.type} = 'image' THEN 1 END)::INTEGER`,
          documentCount: sql<number>`COUNT(CASE WHEN ${attachmentTable.type} = 'document' THEN 1 END)::INTEGER`,
          videoCount: sql<number>`COUNT(CASE WHEN ${attachmentTable.type} = 'video' THEN 1 END)::INTEGER`,
          audioCount: sql<number>`COUNT(CASE WHEN ${attachmentTable.type} = 'audio' THEN 1 END)::INTEGER`,
          archiveCount: sql<number>`COUNT(CASE WHEN ${attachmentTable.type} = 'archive' THEN 1 END)::INTEGER`,
          otherCount: sql<number>`COUNT(CASE WHEN ${attachmentTable.type} = 'other' THEN 1 END)::INTEGER`,
        })
        .from(attachmentTable)
        .$dynamic();

      if (targetUserId) {
        query = query.where(eq(attachmentTable.uploadedBy, targetUserId));
      } else if (orgId) {
        query = query
          .leftJoin(
            messageTable,
            eq(messageTable.id, attachmentTable.messageId)
          )
          .leftJoin(channelTable, eq(channelTable.id, messageTable.channelId))
          .where(eq(channelTable.organizationId, orgId));
      }

      const [stats] = await query;

      return {
        totalFiles: stats?.totalFiles ?? 0,
        totalSize: stats?.totalSize ?? 0,
        imageCount: stats?.imageCount ?? 0,
        documentCount: stats?.documentCount ?? 0,
        videoCount: stats?.videoCount ?? 0,
        audioCount: stats?.audioCount ?? 0,
        archiveCount: stats?.archiveCount ?? 0,
        otherCount: stats?.otherCount ?? 0,
      };
    }),

  // Get recent attachments
  getRecent: protectedProcedure
    .input(GetRecentAttachmentsInput)
    .output(RecentAttachmentsListOutput)
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const currentUser = session.user;
      const orgId = session.session.activeOrganizationId;

      if (!orgId) {
        throw new ORPCError("NOT_FOUND", {
          message: "Organization not found.",
        });
      }

      const recentQuery = db
        .select({
          id: attachmentTable.id,
          fileName: attachmentTable.fileName,
          originalName: attachmentTable.originalName,
          type: attachmentTable.type,
          fileSize: attachmentTable.fileSize,
          thumbnailPath: attachmentTable.thumbnailPath,
          createdAt: attachmentTable.createdAt,
          channelName: channelTable.name,
        })
        .from(attachmentTable)
        .leftJoin(messageTable, eq(messageTable.id, attachmentTable.messageId))
        .leftJoin(channelTable, eq(channelTable.id, messageTable.channelId))
        .where(eq(attachmentTable.uploadedBy, currentUser.id))
        // .where(eq(channelTable.organizationId, orgId))
        .orderBy(desc(attachmentTable.createdAt))
        .limit(input.limit)
        .$dynamic();

      const attachments = await recentQuery;

      return {
        attachments: attachments.map((attachment) => ({
          id: attachment.id,
          fileName: attachment.fileName,
          originalName: attachment.originalName,
          type: attachment.type,
          fileSize: attachment.fileSize,
          thumbnailPath: attachment.thumbnailPath,
          createdAt: attachment.createdAt,
          channelName: attachment.channelName,
        })),
      };
    }),
};
