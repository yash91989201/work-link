import { ORPCError } from "@orpc/client";
import {
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
import { SuccessOutput } from "@/lib/schemas/channel";
import {
  CreateMessageInput,
  CreateMessageOutput,
  DeleteMessageInput,
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
        const [newMessage] = await db
          .insert(messageTable)
          .values({
            ...input,
            senderId: user.id,
          })
          .returning();

        if (!newMessage) {
          throw new ORPCError("NOT_FOUND", {
            message: "Failed to create message",
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
              entityId: newMessage.id,
              entityType: "message",
            })
          );

          await db.insert(notificationTable).values(mentionNotifications);
        }

        return newMessage;
      }
    ),

  update: protectedProcedure
    .input(UpdateMessageInput)
    .output(UpdateMessageOutput)
    .handler(async ({ input, context }) => {
      const [updatedMessage] = await context.db
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

      return {
        ...updatedMessage,
        sender: {
          name: context.session.user.name,
          email: context.session.user.email,
          image: context.session.user.image ?? null,
        },
      };
    }),

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
    .output(SuccessOutput)
    .handler(async ({ input, context }) => {
      const { db } = context;

      // Use a transaction to ensure atomicity
      await db.transaction(async (tx) => {
        // First check if the message exists and user has permission
        const message = await tx.query.messageTable.findFirst({
          where: eq(messageTable.id, input.messageId),
          columns: { id: true, senderId: true },
        });

        if (!message) {
          throw new ORPCError("NOT_FOUND", {
            message: "Message not found.",
          });
        }

        // Check if user is the sender or has admin privileges (you may want to add role-based checks)
        if (message.senderId !== context.session.user.id) {
          throw new ORPCError("FORBIDDEN", {
            message: "You can only delete your own messages.",
          });
        }

        // Recursively soft delete the message and all its descendants
        await tx.execute(sql`
          WITH RECURSIVE message_tree AS (
            -- Start with the root message to delete
            SELECT id, parent_message_id, 1 as depth
            FROM message
            WHERE id = ${input.messageId}
            
            UNION ALL
            
            -- Find all child message recursively
            SELECT m.id, m.parent_message_id, mt.depth + 1
            FROM message m
            INNER JOIN message_tree mt ON m.parent_message_id = mt.id
            WHERE m.is_deleted = false
          )
          UPDATE message 
          SET 
            is_deleted = true, 
            deleted_at = NOW(),
            -- Clear thread information for deleted message
            thread_count = 0
          WHERE id IN (SELECT id FROM message_tree)
        `);

        // update parent message thread counts
        await tx.execute(sql`
          UPDATE message
          SET thread_count = (
            SELECT COUNT(*) 
            FROM message
            WHERE parent_message_id = message.id AND is_deleted = false
          )
          WHERE id IN (
            SELECT DISTINCT parent_message_id 
            FROM message
            WHERE parent_message_id IS NOT NULL 
            AND id IN (SELECT id FROM (
              WITH RECURSIVE message_tree AS (
                SELECT id, parent_message_id
                FROM message
                WHERE id = ${input.messageId}
                UNION ALL
                SELECT m.id, m.parent_message_id
                FROM message m
                INNER JOIN message_tree mt ON m.parent_message_id = mt.id
              )
              SELECT parent_message_id 
              FROM message_tree 
              WHERE parent_message_id IS NOT NULL
            ) AS parent_ids)
          )
        `);
      });

      return {
        success: true,
        message: "Message deleted successfully.",
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
    .handler(async ({ context, input }) => {
      await context.db
        .update(messageTable)
        .set({
          isPinned: true,
          pinnedAt: new Date(),
          pinnedBy: context.session.user.id,
        })
        .where(eq(messageTable.id, input.messageId))
        .returning();

      return {
        success: true,
        message: "Message pinned successfully.",
      };
    }),
  unPin: protectedProcedure
    .input(UnPinMessageInput)
    .output(UnPinMessageOutput)
    .handler(async ({ context, input }) => {
      await context.db
        .update(messageTable)
        .set({
          isPinned: false,
          pinnedAt: null,
          pinnedBy: null,
        })
        .where(eq(messageTable.id, input.messageId))
        .returning();

      return {
        success: true,
        message: "Message unpinned successfully.",
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
};
