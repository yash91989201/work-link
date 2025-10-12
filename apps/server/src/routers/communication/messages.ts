import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import { user as userTable } from "@/db/schema/auth";
import {
  channelMemberTable,
  messageTable,
  notificationTable,
} from "@/db/schema/communication";
import { protectedProcedure } from "@/lib/orpc";
import { SuccessOutput } from "@/lib/schemas/channel";
import {
  AddReactionInput,
  CreateMessageInput,
  CreateMessageOutput,
  DeleteMessageInput,
  GetChannelMessagesInput,
  GetChannelMessagesOutput,
  GetMessageInput,
  GetMessageOutput,
  GetPinnedMessagesInput,
  GetPinnedMessagesOutput,
  GetUnreadCountInput,
  PinMessageInput,
  PinMessageOutput,
  RemoveReactionInput,
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

export const messagesRouter = {
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

        const channel = supabase.channel(`org:channel:${input.channelId}`);

        channel.subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await channel.send({
              type: "broadcast",
              event: "new-message",
              payload: {
                message: {
                  ...newMessage,
                  sender: user,
                },
              },
            });

            supabase.removeChannel(channel);
          }
        });

        return newMessage;
      }
    ),

  update: protectedProcedure
    .input(UpdateMessageInput)
    .output(UpdateMessageOutput)
    .handler(async ({ input, context }) => {
      const updatedMessages = await context.db
        .update(messageTable)
        .set({
          content: input.content,
          mentions: input.mentions,
          isEdited: true,
          editedAt: new Date(),
        })
        .where(eq(messageTable.id, input.messageId))
        .returning();

      if (updatedMessages.length === 0) {
        throw new Error("Message not found");
      }

      const updatedMessage = updatedMessages[0];

      const channelName = `org:channel:${updatedMessage.channelId}`;
      const channel = supabase.channel(channelName);

      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.send({
            type: "broadcast",
            event: "message-updated",
            payload: {
              message: updatedMessage,
            },
          });

          supabase.removeChannel(channel);
        }
      });

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
          sender: {
            columns: {
              name: true,
              email: true,
              image: true,
            },
          },
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
      const [deletedMessage] = await context.db
        .update(messageTable)
        .set({
          isDeleted: true,
          deletedAt: new Date(),
        })
        .where(eq(messageTable.id, input.messageId))
        .returning();

      const channelName = `org:channel:${deletedMessage.channelId}`;
      const channel = supabase.channel(channelName);

      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.send({
            type: "broadcast",
            event: "message-deleted",
            payload: {
              messageId: input.messageId,
            },
          });

          supabase.removeChannel(channel);
        }
      });

      return {
        success: true,
        message: "Message deleted successfully.",
      };
    }),

  addReaction: protectedProcedure
    .input(AddReactionInput)
    .output(SuccessOutput)
    .handler(async ({ input, context }) => {
      const existingMessage = await context.db.query.messageTable.findFirst({
        where: eq(messageTable.id, input.messageId),
        columns: {
          reactions: true,
        },
      });

      if (!existingMessage) {
        return {
          success: false,
          message: "Message not found.",
        };
      }

      const existingReactions =
        (existingMessage.reactions as { reaction: string; count: number }[]) ??
        [];

      const updatedReactions = [...existingReactions];
      const existingReactionIndex = updatedReactions.findIndex(
        (r) => r.reaction === input.emoji
      );

      if (existingReactionIndex >= 0) {
        updatedReactions[existingReactionIndex] = {
          ...updatedReactions[existingReactionIndex],
          count: updatedReactions[existingReactionIndex].count + 1,
        };
      } else {
        updatedReactions.push({
          reaction: input.emoji,
          count: 1,
        });
      }

      const [updatedMessage] = await context.db
        .update(messageTable)
        .set({
          reactions: updatedReactions,
        })
        .where(eq(messageTable.id, input.messageId))
        .returning();

      // Broadcast to realtime channel
      const channel = supabase.channel(
        `org:channel:${updatedMessage.channelId}`
      );

      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.send({
            type: "broadcast",
            event: "message-reaction-added",
            payload: {
              messageId: input.messageId,
              reactions: updatedReactions,
            },
          });

          supabase.removeChannel(channel);
        }
      });

      return {
        success: true,
        message: "Reaction added successfully.",
      };
    }),

  removeReaction: protectedProcedure
    .input(RemoveReactionInput)
    .output(SuccessOutput)
    .handler(async ({ input, context }) => {
      const existingMessage = await context.db.query.messageTable.findFirst({
        where: eq(messageTable.id, input.messageId),
        columns: {
          reactions: true,
        },
      });

      if (!existingMessage) {
        return {
          success: false,
          message: "Message not found.",
        };
      }

      const existingReactions =
        (existingMessage.reactions as { reaction: string; count: number }[]) ??
        [];

      const updatedReactions = [...existingReactions];
      const existingReactionIndex = updatedReactions.findIndex(
        (r) => r.reaction === input.emoji
      );

      if (existingReactionIndex >= 0) {
        if (updatedReactions[existingReactionIndex].count > 1) {
          updatedReactions[existingReactionIndex] = {
            ...updatedReactions[existingReactionIndex],
            count: updatedReactions[existingReactionIndex].count - 1,
          };
        } else {
          updatedReactions.splice(existingReactionIndex, 1);
        }
      }

      const [updatedMessage] = await context.db
        .update(messageTable)
        .set({
          reactions: updatedReactions,
        })
        .where(eq(messageTable.id, input.messageId))
        .returning();

      // Broadcast to realtime channel
      const channelName = `org:channel:${updatedMessage.channelId}`;
      const channel = supabase.channel(channelName);

      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.send({
            type: "broadcast",
            event: "message-reaction-removed",
            payload: {
              messageId: input.messageId,
              reactions: updatedReactions,
            },
          });

          supabase.removeChannel(channel);
        }
      });

      return {
        success: true,
        message: "Reaction removed successfully.",
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
      const [updatedMessage] = await context.db
        .update(messageTable)
        .set({
          isPinned: true,
          pinnedAt: new Date(),
          pinnedBy: context.session.user.id,
        })
        .where(eq(messageTable.id, input.messageId))
        .returning();

      // Broadcast to realtime channel
      const channelName = `org:channel:${updatedMessage.channelId}`;
      const channel = supabase.channel(channelName);

      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.send({
            type: "broadcast",
            event: "message-pinned",
            payload: {
              messageId: input.messageId,
              isPinned: true,
              pinnedAt: new Date(),
            },
          });

          supabase.removeChannel(channel);
        }
      });

      return {
        success: true,
        message: "Message pinned successfully.",
      };
    }),
  unPin: protectedProcedure
    .input(UnPinMessageInput)
    .output(UnPinMessageOutput)
    .handler(async ({ context, input }) => {
      // Get the message to get channel info for broadcasting

      const [updatedMessage] = await context.db
        .update(messageTable)
        .set({
          isPinned: false,
          pinnedAt: null,
          pinnedBy: null,
        })
        .where(eq(messageTable.id, input.messageId))
        .returning();

      // Broadcast to realtime channel
      const channelName = `org:channel:${updatedMessage.channelId}`;
      const channel = supabase.channel(channelName);

      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.send({
            type: "broadcast",
            event: "message-unpinned",
            payload: {
              messageId: input.messageId,
              isPinned: false,
              pinnedAt: null,
            },
          });

          supabase.removeChannel(channel);
        }
      });

      return {
        success: true,
        message: "Message unpinned successfully.",
      };
    }),
  getPinnedMessages: protectedProcedure
    .input(GetPinnedMessagesInput)
    .output(GetPinnedMessagesOutput)
    .handler(async ({ context, input }) => {
      const pinnedMessages = await context.db.query.messageTable.findMany({
        where: and(
          eq(messageTable.isPinned, true),
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

      return pinnedMessages;
    }),
};
