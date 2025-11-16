import { ORPCError } from "@orpc/client";
import {
  attachmentTable,
  channelMemberTable,
  messageTable,
  notificationTable,
  user as userTable,
} from "@work-link/db/schema/index";
import {
  and,
  desc,
  eq,
  getTableColumns,
  ilike,
  inArray,
  or,
  sql,
} from "drizzle-orm";
import { protectedProcedure } from "@/index";
import { generateTxId } from "@/lib/electric-proxy";
import {
  AddReactionInput,
  AddReactionOutput,
  CreateMessageInput,
  CreateMessageOutput,
  DeleteMessageInput,
  DeleteMessageOutput,
  GetChannelMessagesInput,
  GetChannelMessagesOutput,
  GetMenionUsersInput,
  GetMenionUsersOutput,
  GetMessageInput,
  GetMessageOutput,
  GetPinnedMessagesInput,
  GetPinnedMessagesOutput,
  GetUnreadCountInput,
  PinMessageInput,
  PinMessageOutput,
  RemoveReactionInput,
  RemoveReactionOutput,
  SearchMessageOutput,
  SearchMessagesInput,
  SearchUsersInput,
  SearchUsersOutput,
  UnPinMessageInput,
  UnPinMessageOutput,
  UnreadCountOutput,
  UpdateMessageInput,
  UpdateMessageOutput,
} from "@/lib/schemas/message";
import { supabase } from "@/lib/supabase";

export const messageRouter = {
  searchUsers: protectedProcedure
    .input(SearchUsersInput)
    .output(SearchUsersOutput)
    .handler(async ({ input, context }) => {
      const users = await context.db
        .select({
          id: userTable.id,
          name: userTable.name,
          email: userTable.email,
          image: userTable.image,
        })
        .from(channelMemberTable)
        .innerJoin(userTable, eq(channelMemberTable.userId, userTable.id))
        .where(
          and(
            eq(channelMemberTable.channelId, input.channelId),
            or(
              ilike(userTable.name, `%${input.query}%`),
              ilike(userTable.email, `%${input.query}%`)
            )
          )
        )
        .limit(input.limit);

      return { users };
    }),

  create: protectedProcedure
    .input(CreateMessageInput)
    .output(CreateMessageOutput)
    .handler(
      async ({
        context: {
          db,
          session: { user },
        },
        input,
      }) => {
        const { txid, message } = await db.transaction(async (tx) => {
          const txid = await generateTxId(tx);
          const [newMessage] = await tx
            .insert(messageTable)
            .values({
              channelId: input.channelId,
              receiverId: input.receiverId,
              content: input.content,
              type: input.type,
              parentMessageId: input.parentMessageId,
              mentions: input.mentions,
              senderId: user.id,
            })
            .returning();

          if (!newMessage) {
            throw new ORPCError("NOT_FOUND", {
              message: "Failed to create message",
            });
          }

          // Handle attachments
          if (input.attachments && input.attachments.length > 0) {
            const attachmentValues = input.attachments.map((attachment) => ({
              messageId: newMessage.id,
              fileName: attachment.fileName,
              originalName: attachment.originalName,
              fileSize: attachment.fileSize,
              mimeType: attachment.mimeType,
              type: attachment.type,
              url: attachment.url,
              uploadedBy: user.id,
            }));

            await tx.insert(attachmentTable).values(attachmentValues);
          }

          if (input.mentions && input.mentions.length > 0) {
            const mentionNotifications = input.mentions.map(
              (mentionedUserId) => ({
                userId: mentionedUserId,
                type: "mention" as const,
                title: `${user.name || user.email} mentioned you`,
                message:
                  input.content?.slice(0, 200) ||
                  "You were mentioned in a message",
                entityId: newMessage.id,
                entityType: "message",
              })
            );

            await tx.insert(notificationTable).values(mentionNotifications);
          }

          if (input.parentMessageId) {
            await tx
              .update(messageTable)
              .set({
                threadCount: sql`${messageTable.threadCount} + 1`,
              })
              .where(eq(messageTable.id, input.parentMessageId));
          }

          return { txid, message: newMessage };
        });

        return { txid, message };
      }
    ),

  update: protectedProcedure
    .input(UpdateMessageInput)
    .output(UpdateMessageOutput)
    .handler(
      async ({
        context: {
          db,
          session: { user },
        },
        input,
      }) => {
        const { txid, message } = await db.transaction(async (tx) => {
          const txid = await generateTxId(tx);

          const [updatedMessage] = await tx
            .update(messageTable)
            .set({
              content: input.content,
              mentions: input.mentions,
              isEdited: true,
              editedAt: new Date(),
            })
            .where(eq(messageTable.id, input.messageId))
            .returning();

          if (!updatedMessage) {
            throw new ORPCError("BAD_REQUEST", {
              message: "Failed to update message.",
            });
          }

          if (input.mentions && input.mentions.length > 0) {
            const mentionNotifications = input.mentions.map(
              (mentionedUserId) => ({
                userId: mentionedUserId,
                type: "mention" as const,
                title: `${user.name || user.email} mentioned you`,
                message:
                  input.content?.slice(0, 200) ||
                  "You were mentioned in a message",
                entityId: updatedMessage.id,
                entityType: "message",
              })
            );

            await tx.insert(notificationTable).values(mentionNotifications);
          }

          return { txid, message: updatedMessage };
        });

        return {
          txid,
          message: {
            ...message,
            sender: {
              name: user.name,
              email: user.email,
              createdAt: user.createdAt,
              emailVerified: user.emailVerified,
              id: user.id,
              updatedAt: user.updatedAt,
              image: user.image ?? null,
            },
          },
        };
      }
    ),

  getChannelMessages: protectedProcedure
    .input(GetChannelMessagesInput)
    .output(GetChannelMessagesOutput)
    .handler(async ({ input, context }) => {
      const messages = await context.db.query.messageTable.findMany({
        where: and(
          eq(messageTable.channelId, input.channelId),
          eq(messageTable.isDeleted, false)
        ),
        with: {
          sender: true,
          attachments: true,
          parentMessage: {
            with: {
              sender: {
                columns: {
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      return {
        messages,
      };
    }),

  delete: protectedProcedure
    .input(DeleteMessageInput)
    .output(DeleteMessageOutput)
    .handler(async ({ input, context }) => {
      const { db } = context;

      const { txid } = await db.transaction(async (tx) => {
        const txid = await generateTxId(tx);

        const message = await tx.query.messageTable.findFirst({
          where: eq(messageTable.id, input.messageId),
          columns: { id: true, senderId: true, parentMessageId: true },
          with: {
            attachments: {
              columns: {
                fileName: true,
                type: true,
              },
            },
          },
        });

        if (!message) {
          throw new ORPCError("NOT_FOUND", {
            message: "Message not found.",
          });
        }

        if (message.attachments && message.attachments.length > 0) {
          for (const attachment of message.attachments) {
            const bucket =
              attachment.type === "audio"
                ? "message-audio"
                : "message-attachment";

            const { error } = await supabase.storage
              .from(bucket)
              .remove([attachment.fileName]);

            if (error) {
              console.error(
                `Failed to delete file ${attachment.fileName} from ${bucket}:`,
                error
              );
            }
          }
        }

        await tx
          .delete(messageTable)
          .where(eq(messageTable.id, input.messageId));

        await tx
          .delete(attachmentTable)
          .where(eq(attachmentTable.messageId, input.messageId));

        await tx
          .delete(messageTable)
          .where(eq(messageTable.parentMessageId, input.messageId));

        return { txid };
      });

      return {
        txid,
      };
    }),

  getUnreadCount: protectedProcedure
    .input(GetUnreadCountInput)
    .output(UnreadCountOutput)
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const currentUser = session.user;

      const membership = await db.query.channelMemberTable.findFirst({
        where: and(
          eq(channelMemberTable.channelId, input.channelId),
          eq(channelMemberTable.userId, currentUser.id)
        ),
      });

      if (!membership?.lastReadAt) {
        const [messageCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(messageTable)
          .where(
            and(
              eq(messageTable.channelId, input.channelId),
              eq(messageTable.isDeleted, false)
            )
          );

        return { count: messageCount?.count ?? 0 };
      }

      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(messageTable)
        .where(
          and(
            eq(messageTable.channelId, input.channelId),
            eq(messageTable.isDeleted, false),
            sql`${messageTable.createdAt} > ${membership.lastReadAt}`
          )
        );

      return { count: result?.count ?? 0 };
    }),

  search: protectedProcedure
    .input(SearchMessagesInput)
    .output(SearchMessageOutput)
    .handler(async ({ input, context }) => {
      const messages = await context.db
        .select({
          ...getTableColumns(messageTable),
          sender: {
            name: userTable.name,
            email: userTable.email,
            image: userTable.image,
          },
        })
        .from(messageTable)
        .innerJoin(userTable, eq(messageTable.senderId, userTable.id))
        .where(
          and(
            eq(messageTable.channelId, input.channelId),
            eq(messageTable.isDeleted, false),
            ilike(messageTable.content, `%${input.query}%`)
          )
        )
        .orderBy(desc(messageTable.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return {
        messages,
        total: messages.length,
        hasMore: messages.length === input.limit,
      };
    }),

  get: protectedProcedure
    .input(GetMessageInput)
    .output(GetMessageOutput)
    .handler(async ({ input, context }) => {
      const message = await context.db.query.messageTable.findFirst({
        where: eq(messageTable.id, input.messageId),
        with: {
          sender: {
            columns: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      return message;
    }),

  getParent: protectedProcedure
    .input(GetMessageInput)
    .output(GetMessageOutput)
    .handler(async ({ input, context: { db } }) => {
      const parentMessage = await db.query.messageTable.findFirst({
        where: eq(messageTable.parentMessageId, input.messageId),
        with: {
          sender: {
            columns: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      return parentMessage;
    }),

  pin: protectedProcedure
    .input(PinMessageInput)
    .output(PinMessageOutput)
    .handler(
      async ({
        context: {
          db,
          session: { user },
        },
        input,
      }) => {
        const { txid } = await db.transaction(async (tx) => {
          const txid = await generateTxId(tx);

          await tx
            .update(messageTable)
            .set({
              isPinned: true,
              pinnedAt: new Date(),
              pinnedBy: user.id,
            })
            .where(eq(messageTable.id, input.messageId))
            .returning();

          return { txid };
        });

        return {
          txid,
        };
      }
    ),
  unPin: protectedProcedure
    .input(UnPinMessageInput)
    .output(UnPinMessageOutput)
    .handler(async ({ context: { db }, input }) => {
      const { txid } = await db.transaction(async (tx) => {
        const txid = await generateTxId(tx);

        await tx
          .update(messageTable)
          .set({
            isPinned: false,
            pinnedAt: null,
            pinnedBy: null,
          })
          .where(eq(messageTable.id, input.messageId))
          .returning();

        return { txid };
      });

      return {
        txid,
      };
    }),
  getPinnedMessages: protectedProcedure
    .input(GetPinnedMessagesInput)
    .output(GetPinnedMessagesOutput)
    .handler(async ({ context, input }) => {
      const baseConditions = [
        eq(messageTable.isPinned, true),
        eq(messageTable.channelId, input.channelId),
        eq(messageTable.isDeleted, false),
      ];

      if (input.query?.trim()) {
        const searchCondition = ilike(messageTable.content, `%${input.query}%`);

        if (searchCondition) {
          baseConditions.push(searchCondition);
        }
      }

      const pinnedMessages = await context.db.query.messageTable.findMany({
        where: and(...baseConditions),
        with: {
          sender: true,
        },
      });

      return pinnedMessages;
    }),
  getMentionUsers: protectedProcedure
    .input(GetMenionUsersInput)
    .output(GetMenionUsersOutput)
    .handler(async ({ context: { db }, input }) => {
      const users = await db.query.user.findMany({
        where: inArray(userTable.id, input.userIds),
      });

      return users;
    }),

  addReaction: protectedProcedure
    .input(AddReactionInput)
    .output(AddReactionOutput)
    .handler(async ({ context, input }) => {
      const { db, session } = context;
      const userId = session.user.id;

      const { txid } = await db.transaction(async (tx) => {
        const txid = await generateTxId(tx);

        const message = await tx.query.messageTable.findFirst({
          where: eq(messageTable.id, input.messageId),
          columns: { id: true, reactions: true },
        });

        if (!message) {
          throw new ORPCError("NOT_FOUND", {
            message: "Message not found.",
          });
        }

        const reactions = message.reactions || [];
        const reactionIndex = reactions.findIndex(
          (r) => r.reaction === input.emoji && r.userId === userId
        );

        if (reactionIndex === -1) {
          reactions.push({
            reaction: input.emoji,
            userId,
            createdAt: new Date().toISOString(),
          });

          await tx
            .update(messageTable)
            .set({ reactions })
            .where(eq(messageTable.id, input.messageId));
        }

        return { txid };
      });

      return {
        txid,
        success: true,
        message: "Reaction added successfully.",
      };
    }),

  removeReaction: protectedProcedure
    .input(RemoveReactionInput)
    .output(RemoveReactionOutput)
    .handler(async ({ context, input }) => {
      const { db, session } = context;
      const userId = session.user.id;

      const { txid } = await db.transaction(async (tx) => {
        const txid = await generateTxId(tx);

        const message = await tx.query.messageTable.findFirst({
          where: eq(messageTable.id, input.messageId),
          columns: { id: true, reactions: true },
        });

        if (!message) {
          throw new ORPCError("NOT_FOUND", {
            message: "Message not found.",
          });
        }

        const reactions = (message.reactions || []).filter(
          (r) => !(r.reaction === input.emoji && r.userId === userId)
        );

        await tx
          .update(messageTable)
          .set({ reactions })
          .where(eq(messageTable.id, input.messageId));

        return { txid };
      });

      return {
        txid,
        success: true,
        message: "Reaction removed successfully.",
      };
    }),
};
