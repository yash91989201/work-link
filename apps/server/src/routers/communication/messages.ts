import { ORPCError } from "@orpc/server";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { user as userTable } from "@/db/schema/auth";
import {
  channelMemberTable,
  channelTable,
  messageReadTable,
  messageTable,
} from "@/db/schema/communication";
import type { Context } from "@/lib/context";
import { protectedProcedure } from "@/lib/orpc";
import { SuccessOutput } from "@/lib/schemas/channel";
import { MessageSchema } from "@/lib/schemas/db-tables";
import {
  AddReactionInput,
  CreateMessageInput,
  DeleteMessageInput,
  GetChannelMessagesInput,
  GetChannelMessagesOutput,
  GetMessageInput,
  GetUnreadCountInput,
  MarkMessageAsReadInput,
  MessageWithSenderOutput,
  RemoveReactionInput,
  SearchMessageOutput,
  SearchMessagesInput,
  SearchMessagesListOutput,
  UnreadCountOutput,
  UpdateMessageInput,
} from "@/lib/schemas/message";

type Database = Context["db"];

const normalizeMentions = (value: unknown) => {
  if (!Array.isArray(value)) {
    return null;
  }

  return value.map((mention) => String(mention));
};

const normalizeReactions = (value: unknown) => {
  if (value == null || typeof value !== "object") {
    return {} as Record<string, string[]>;
  }

  const reactions = value as Record<string, unknown>;
  return Object.entries(reactions).reduce<Record<string, string[]>>(
    (accumulator, [emoji, users]) => {
      if (Array.isArray(users)) {
        accumulator[emoji] = users.map((userId) => String(userId));
      }
      return accumulator;
    },
    {}
  );
};

const getChannelRecord = async (db: Database, channelId: string) => {
  const [channel] = await db
    .select({
      id: channelTable.id,
      isPrivate: channelTable.isPrivate,
    })
    .from(channelTable)
    .where(eq(channelTable.id, channelId))
    .limit(1);

  return channel ?? null;
};

const isChannelMember = async (
  db: Database,
  channelId: string,
  userId: string
) => {
  const [membership] = await db
    .select({ id: channelMemberTable.id })
    .from(channelMemberTable)
    .where(
      and(
        eq(channelMemberTable.channelId, channelId),
        eq(channelMemberTable.userId, userId)
      )
    )
    .limit(1);

  return membership != null;
};

const hasChannelAccess = async (
  db: Database,
  channelId: string,
  userId: string
) => {
  const channel = await getChannelRecord(db, channelId);
  if (!channel) {
    return false;
  }

  if (!channel.isPrivate) {
    return true;
  }

  return isChannelMember(db, channelId, userId);
};

const mapMessageWithSender = <
  T extends {
    mentions: unknown;
    senderName: string | null;
    senderEmail: string | null;
    senderImage: string | null;
  },
>(
  message: T
) => ({
  ...message,
  mentions: normalizeMentions(message.mentions),
});

const parseMessageWithSender = (
  message: ReturnType<typeof mapMessageWithSender>
) =>
  MessageWithSenderOutput.parse({
    ...message,
    attachments: [],
  });

const getMessageById = async (db: Database, messageId: string) => {
  const [message] = await db
    .select({
      id: messageTable.id,
      channelId: messageTable.channelId,
      senderId: messageTable.senderId,
      receiverId: messageTable.receiverId,
      content: messageTable.content,
      type: messageTable.type,
      parentMessageId: messageTable.parentMessageId,
      threadCount: messageTable.threadCount,
      isEdited: messageTable.isEdited,
      editedAt: messageTable.editedAt,
      mentions: messageTable.mentions,
      isDeleted: messageTable.isDeleted,
      deletedAt: messageTable.deletedAt,
      reactions: messageTable.reactions,
      createdAt: messageTable.createdAt,
      updatedAt: messageTable.updatedAt,
      senderName: userTable.name,
      senderEmail: userTable.email,
      senderImage: userTable.image,
    })
    .from(messageTable)
    .innerJoin(userTable, eq(messageTable.senderId, userTable.id))
    .where(
      and(eq(messageTable.id, messageId), eq(messageTable.isDeleted, false))
    )
    .limit(1);

  if (!message) {
    return null;
  }

  return mapMessageWithSender({
    ...message,
    reactions: normalizeReactions(message.reactions),
  });
};

const updateMessageContent = async (
  db: Database,
  messageId: string,
  content: string
) => {
  const [message] = await db
    .update(messageTable)
    .set({
      content,
      isEdited: true,
      editedAt: new Date(),
    })
    .where(eq(messageTable.id, messageId))
    .returning();

  return message ?? null;
};

const addReactionToMessage = async (
  db: Database,
  messageId: string,
  userId: string,
  emoji: string
) => {
  const existing = await db.query.messageTable.findFirst({
    where: eq(messageTable.id, messageId),
  });

  if (!existing) {
    return;
  }

  const reactions = normalizeReactions(existing.reactions);
  const users = new Set(reactions[emoji] ?? []);
  users.add(userId);
  reactions[emoji] = Array.from(users);

  await db
    .update(messageTable)
    .set({ reactions })
    .where(eq(messageTable.id, messageId));
};

const removeReactionFromMessage = async (
  db: Database,
  messageId: string,
  userId: string,
  emoji: string
) => {
  const existing = await db.query.messageTable.findFirst({
    where: eq(messageTable.id, messageId),
  });

  if (!existing) {
    return;
  }

  const reactions = normalizeReactions(existing.reactions);
  const filtered = (reactions[emoji] ?? []).filter((id) => id !== userId);

  if (filtered.length > 0) {
    reactions[emoji] = filtered;
  } else {
    delete reactions[emoji];
  }

  await db
    .update(messageTable)
    .set({ reactions })
    .where(eq(messageTable.id, messageId));
};

const markMessageRead = async (
  db: Database,
  messageId: string,
  userId: string
) => {
  await db
    .insert(messageReadTable)
    .values({
      messageId,
      userId,
      readAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [messageReadTable.messageId, messageReadTable.userId],
      set: { readAt: new Date() },
    });
};

const getUnreadCountForChannel = async (
  db: Database,
  channelId: string,
  userId: string
) => {
  const membership = await db.query.channelMemberTable.findFirst({
    where: and(
      eq(channelMemberTable.channelId, channelId),
      eq(channelMemberTable.userId, userId)
    ),
  });

  if (!membership?.lastReadAt) {
    const [messageCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(messageTable)
      .where(
        and(
          eq(messageTable.channelId, channelId),
          eq(messageTable.isDeleted, false)
        )
      );

    return messageCount?.count ?? 0;
  }

  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(messageTable)
    .where(
      and(
        eq(messageTable.channelId, channelId),
        eq(messageTable.isDeleted, false),
        sql`${messageTable.createdAt} > ${membership.lastReadAt}`
      )
    );

  return result?.count ?? 0;
};

const searchChannelMessages = async (
  db: Database,
  channelId: string,
  queryString: string,
  options: { limit: number; offset: number }
) => {
  const rows = await db
    .select({
      id: messageTable.id,
      channelId: messageTable.channelId,
      senderId: messageTable.senderId,
      receiverId: messageTable.receiverId,
      content: messageTable.content,
      type: messageTable.type,
      parentMessageId: messageTable.parentMessageId,
      threadCount: messageTable.threadCount,
      isEdited: messageTable.isEdited,
      editedAt: messageTable.editedAt,
      mentions: messageTable.mentions,
      isDeleted: messageTable.isDeleted,
      deletedAt: messageTable.deletedAt,
      reactions: messageTable.reactions,
      createdAt: messageTable.createdAt,
      updatedAt: messageTable.updatedAt,
      senderName: userTable.name,
      senderEmail: userTable.email,
      senderImage: userTable.image,
    })
    .from(messageTable)
    .innerJoin(userTable, eq(messageTable.senderId, userTable.id))
    .where(
      and(
        eq(messageTable.channelId, channelId),
        eq(messageTable.isDeleted, false),
        ilike(messageTable.content, `%${queryString}%`)
      )
    )
    .orderBy(desc(messageTable.createdAt))
    .limit(options.limit)
    .offset(options.offset);

  return rows.map((row) => mapMessageWithSender(row));
};

export const messagesRouter = {
  // Create a new message
  create: protectedProcedure
    .input(CreateMessageInput)
    .output(MessageSchema)
    .handler(async ({ input, context }) => {
      const user = context.session.user;

      const [newMessage] = await context.db
        .insert(messageTable)
        .values({
          ...input,
          senderId: user.id,
        })
        .returning();

      return newMessage;
    }),

  // Update a message
  update: protectedProcedure
    .input(UpdateMessageInput)
    .output(MessageWithSenderOutput)
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const currentUser = session.user;

      const message = await getMessageById(db, input.messageId);
      if (!message) {
        throw new ORPCError("NOT_FOUND", {
          message: "Message not found.",
        });
      }

      if (message.senderId !== currentUser.id) {
        throw new ORPCError("FORBIDDEN", {
          message: "You can only edit your own messages.",
        });
      }

      const updated = await updateMessageContent(
        db,
        input.messageId,
        input.content ?? ""
      );

      if (!updated) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to update message.",
        });
      }

      const refreshed = await getMessageById(db, input.messageId);
      if (!refreshed) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to retrieve updated message.",
        });
      }

      return parseMessageWithSender(refreshed);
    }),

  // Get channel messages
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
          sender: {
            columns: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      return {
        messages,
      };
    }),

  // Delete a message
  delete: protectedProcedure
    .input(DeleteMessageInput)
    .output(SuccessOutput)
    .handler(async ({ input, context }) => {
      await context.db
        .update(messageTable)
        .set({
          isDeleted: true,
          deletedAt: new Date(),
        })
        .where(eq(messageTable.id, input.messageId));

      return {
        success: true,
        message: "Message deleted successfully.",
      };
    }),

  // Add reaction to message
  addReaction: protectedProcedure
    .input(AddReactionInput)
    .output(SuccessOutput)
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const currentUser = session.user;

      const message = await getMessageById(db, input.messageId);
      if (!message) {
        throw new ORPCError("NOT_FOUND", {
          message: "Message not found.",
        });
      }

      if (message.channelId) {
        const access = await hasChannelAccess(
          db,
          message.channelId,
          currentUser.id
        );
        if (!access) {
          throw new ORPCError("FORBIDDEN", {
            message: "You don't have access to this channel.",
          });
        }
      } else if (
        message.senderId !== currentUser.id &&
        message.receiverId !== currentUser.id
      ) {
        throw new ORPCError("FORBIDDEN", {
          message: "You don't have access to this conversation.",
        });
      }

      await addReactionToMessage(
        db,
        input.messageId,
        currentUser.id,
        input.emoji
      );

      return {
        success: true,
        message: "Reaction added successfully.",
      };
    }),

  // Remove reaction from message
  removeReaction: protectedProcedure
    .input(RemoveReactionInput)
    .output(SuccessOutput)
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const currentUser = session.user;

      const message = await getMessageById(db, input.messageId);
      if (!message) {
        throw new ORPCError("NOT_FOUND", {
          message: "Message not found.",
        });
      }

      if (message.channelId) {
        const access = await hasChannelAccess(
          db,
          message.channelId,
          currentUser.id
        );
        if (!access) {
          throw new ORPCError("FORBIDDEN", {
            message: "You don't have access to this channel.",
          });
        }
      } else if (
        message.senderId !== currentUser.id &&
        message.receiverId !== currentUser.id
      ) {
        throw new ORPCError("FORBIDDEN", {
          message: "You don't have access to this conversation.",
        });
      }

      await removeReactionFromMessage(
        db,
        input.messageId,
        currentUser.id,
        input.emoji
      );

      return {
        success: true,
        message: "Reaction removed successfully.",
      };
    }),

  // Mark message as read
  markAsRead: protectedProcedure
    .input(MarkMessageAsReadInput)
    .output(SuccessOutput)
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const currentUser = session.user;

      const message = await getMessageById(db, input.messageId);
      if (!message) {
        throw new ORPCError("NOT_FOUND", {
          message: "Message not found.",
        });
      }

      if (message.channelId) {
        const access = await hasChannelAccess(
          db,
          message.channelId,
          currentUser.id
        );
        if (!access) {
          throw new ORPCError("FORBIDDEN", {
            message: "You don't have access to this channel.",
          });
        }
      } else if (
        message.senderId !== currentUser.id &&
        message.receiverId !== currentUser.id
      ) {
        throw new ORPCError("FORBIDDEN", {
          message: "You don't have access to this conversation.",
        });
      }

      await markMessageRead(db, input.messageId, currentUser.id);

      return {
        success: true,
        message: "Message marked as read.",
      };
    }),

  // Get unread count for a channel
  getUnreadCount: protectedProcedure
    .input(GetUnreadCountInput)
    .output(UnreadCountOutput)
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const currentUser = session.user;

      const access = await hasChannelAccess(
        db,
        input.channelId,
        currentUser.id
      );
      if (!access) {
        throw new ORPCError("FORBIDDEN", {
          message: "You don't have access to this channel.",
        });
      }

      const count = await getUnreadCountForChannel(
        db,
        input.channelId,
        currentUser.id
      );

      return { count };
    }),

  // Search messages in a channel
  search: protectedProcedure
    .input(SearchMessagesInput)
    .output(SearchMessagesListOutput)
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const currentUser = session.user;

      const access = await hasChannelAccess(
        db,
        input.channelId,
        currentUser.id
      );
      if (!access) {
        throw new ORPCError("FORBIDDEN", {
          message: "You don't have access to this channel.",
        });
      }

      const messages = await searchChannelMessages(
        db,
        input.channelId,
        input.query,
        {
          limit: input.limit,
          offset: input.offset,
        }
      );

      return {
        messages: messages.map((message) =>
          SearchMessageOutput.parse({
            id: message.id,
            content: message.content,
            type: message.type,
            createdAt: message.createdAt,
            senderId: message.senderId,
            senderName: message.senderName,
            senderImage: message.senderImage,
            mentions: message.mentions,
            attachments: [],
          })
        ),
        total: messages.length,
        hasMore: messages.length === input.limit,
      };
    }),

  // Get a single message
  get: protectedProcedure
    .input(GetMessageInput)
    .output(MessageWithSenderOutput.nullable())
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const currentUser = session.user;

      const message = await getMessageById(db, input.messageId);
      if (!message) {
        return null;
      }

      if (message.channelId) {
        const access = await hasChannelAccess(
          db,
          message.channelId,
          currentUser.id
        );
        if (!access) {
          throw new ORPCError("FORBIDDEN", {
            message: "You don't have access to this channel.",
          });
        }
      } else if (
        message.senderId !== currentUser.id &&
        message.receiverId !== currentUser.id
      ) {
        throw new ORPCError("FORBIDDEN", {
          message: "You don't have access to this conversation.",
        });
      }

      return parseMessageWithSender(message);
    }),
};
