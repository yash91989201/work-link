import type {
  GetChannelMessagesOutputType,
  MessageWithSenderType,
} from "@work-link/api/lib/types";
import { useEffect, useEffectEvent, useRef } from "react";
import { getRealtimeChannel } from "@/utils/channel";
import { queryClient, queryUtils } from "@/utils/orpc";

interface UseMessagesRealtimeOptions {
  channelId: string;
  onNewMessage: () => void;
}

export function useMessagesRealtime(options: UseMessagesRealtimeOptions) {
  const { channelId, onNewMessage } = options;
  const subscribedRef = useRef(false);

  const handleNewMessage = useEffectEvent(() => {
    onNewMessage();
  });

  useEffect(() => {
    const channel = getRealtimeChannel(channelId);

    channel.on("broadcast", { event: "new-message" }, (payload) => {
      const payloadMessage = payload.payload
        .message as unknown as MessageWithSenderType;

      const newMessage = {
        ...payloadMessage,
        createdAt: new Date(payloadMessage.createdAt),
        updatedAt: new Date(payloadMessage.updatedAt),
        ...(payloadMessage.editedAt != null && {
          editedAt: new Date(payloadMessage.editedAt),
        }),
        ...(payloadMessage.deletedAt != null && {
          deletedAt: new Date(payloadMessage.deletedAt),
        }),
      };

      queryClient.setQueryData(
        queryUtils.communication.message.getChannelMessages.queryKey({
          input: {
            channelId,
          },
        }),
        (old) => {
          if (!old) return;

          const messageExists = old.messages.some(
            (msg) => msg.id === newMessage.id
          );

          if (messageExists) {
            return old;
          }

          return {
            ...old,
            messages: [...(old.messages || []), newMessage],
          };
        }
      );

      handleNewMessage();
    });

    channel.on("broadcast", { event: "message-updated" }, (payload) => {
      const payloadMessage = payload.payload
        .message as unknown as GetChannelMessagesOutputType["messages"][number];

      const updatedMessage = {
        ...payloadMessage,
        createdAt: new Date(payloadMessage.createdAt),
        updatedAt: new Date(payloadMessage.updatedAt),
        ...(payloadMessage.editedAt != null && {
          editedAt: new Date(payloadMessage.editedAt),
        }),
        ...(payloadMessage.deletedAt != null && {
          deletedAt: new Date(payloadMessage.deletedAt),
        }),
      };

      queryClient.setQueryData(
        queryUtils.communication.message.getChannelMessages.queryKey({
          input: {
            channelId,
          },
        }),
        (old) => {
          if (!old) return;

          const updatedMessages = old.messages.map((message) =>
            message.id === updatedMessage.id
              ? { ...message, ...updatedMessage }
              : message
          );

          return {
            ...old,
            messages: updatedMessages,
          };
        }
      );
    });

    channel.on("broadcast", { event: "message-deleted" }, (payload) => {
      const { messageId } = payload.payload as { messageId: string };

      queryClient.setQueryData(
        queryUtils.communication.message.getChannelMessages.queryKey({
          input: {
            channelId,
          },
        }),
        (old) => {
          if (!old) return;

          const updatedMessages = old.messages.filter(
            (message) => message.id !== messageId
          );

          return {
            ...old,
            messages: updatedMessages,
          };
        }
      );
    });

    channel.on("broadcast", { event: "message-pinned" }, (payload) => {
      const { messageId } = payload.payload as {
        messageId: string;
      };

      queryClient.setQueryData(
        queryUtils.communication.message.getChannelMessages.queryKey({
          input: {
            channelId,
          },
        }),
        (old) => {
          if (!old) return;
          const updatedMessages = old.messages.map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  isPinned: true,
                  pinnedAt: new Date(),
                }
              : message
          );
          return {
            ...old,
            messages: updatedMessages,
          };
        }
      );
    });

    channel.on("broadcast", { event: "message-unpinned" }, (payload) => {
      const { messageId } = payload.payload as {
        messageId: string;
      };

      queryClient.setQueryData(
        queryUtils.communication.message.getChannelMessages.queryKey({
          input: {
            channelId,
          },
        }),
        (old) => {
          if (!old) return;
          const updatedMessages = old.messages.map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  isPinned: false,
                  pinnedAt: null,
                }
              : message
          );
          return {
            ...old,
            messages: updatedMessages,
          };
        }
      );
    });

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "message",
        filter: `channel_id=eq.${channelId}`,
      },
      (payload) => {
        if (
          payload.eventType === "UPDATE" &&
          payload.new.is_pinned !== payload.old.is_pinned
        ) {
          queryClient.setQueryData(
            queryUtils.communication.message.getChannelMessages.queryKey({
              input: {
                channelId,
              },
            }),
            (old) => {
              if (!old) return old;

              const updatedmessages = old.messages.map((message) => {
                if (message.id === payload.new.id) {
                  return {
                    ...message,
                    isPinned: payload.new.is_pinned,
                  };
                }
                return message;
              });

              return {
                messages: updatedmessages,
              };
            }
          );
        }
      }
    );

    if (!subscribedRef.current) {
      channel.subscribe();
      subscribedRef.current = true;
    }
  }, [channelId]);
}
