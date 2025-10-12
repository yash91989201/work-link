import type {
  GetChannelMessagesOutputType,
  MessageWithSenderType,
} from "@server/lib/types";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { queryClient, queryUtils } from "@/utils/orpc";

interface UseMessagesRealtimeOptions {
  channelId: string;
  onNewMessage: () => void;
}

export function useMessagesRealtime(options: UseMessagesRealtimeOptions) {
  const { channelId, onNewMessage } = options;

  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const channel = supabase.channel(`org:channel:${channelId}`);

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
        queryUtils.communication.messages.getChannelMessages.queryKey({
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

      onNewMessage?.();
    });

    // Handle message updates
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
        queryUtils.communication.messages.getChannelMessages.queryKey({
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
        queryUtils.communication.messages.getChannelMessages.queryKey({
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
      const { messageId, isPinned, pinnedAt } = payload.payload as {
        messageId: string;
        isPinned: boolean;
        pinnedAt: string;
      };

      queryClient.setQueryData(
        queryUtils.communication.messages.getChannelMessages.queryKey({
          input: {
            channelId,
          },
        }),
        (old) => {
          if (!old) return;

          const updatedMessages = old.messages.map((message) => {
            if (message.id === messageId) {
              return {
                ...message,
                isPinned,
                pinnedAt: new Date(pinnedAt),
              };
            }
            return message;
          });

          return {
            ...old,
            messages: updatedMessages,
          };
        }
      );
    });

    channel.on("broadcast", { event: "message-unpinned" }, (payload) => {
      const { messageId, isPinned, pinnedAt } = payload.payload as {
        messageId: string;
        isPinned: boolean;
        pinnedAt: null;
      };

      queryClient.setQueryData(
        queryUtils.communication.messages.getChannelMessages.queryKey({
          input: {
            channelId,
          },
        }),
        (old) => {
          if (!old) return;

          const updatedMessages = old.messages.map((message) => {
            if (message.id === messageId) {
              return {
                ...message,
                isPinned,
                pinnedAt,
              };
            }
            return message;
          });

          return {
            ...old,
            messages: updatedMessages,
          };
        }
      );
    });

    channel.on("broadcast", { event: "message-reaction-added" }, (payload) => {
      const { messageId, reactions } = payload.payload as {
        messageId: string;
        reactions: { reaction: string; count: number }[];
      };

      queryClient.setQueryData(
        queryUtils.communication.messages.getChannelMessages.queryKey({
          input: {
            channelId,
          },
        }),
        (old) => {
          if (!old) return;

          const updatedMessages = old.messages.map((message) => {
            if (message.id === messageId) {
              // Only update if reactions are different
              if (
                JSON.stringify(message.reactions) !== JSON.stringify(reactions)
              ) {
                return { ...message, reactions };
              }
              return message;
            }
            return message;
          });

          return {
            ...old,
            messages: updatedMessages,
          };
        }
      );
    });

    channel.on(
      "broadcast",
      { event: "message-reaction-removed" },
      (payload) => {
        const { messageId, reactions } = payload.payload as {
          messageId: string;
          reactions: { reaction: string; count: number }[];
        };

        queryClient.setQueryData(
          queryUtils.communication.messages.getChannelMessages.queryKey({
            input: {
              channelId,
            },
          }),
          (old) => {
            if (!old) return;

            const updatedMessages = old.messages.map((message) =>
              message.id === messageId ? { ...message, reactions } : message
            );

            return {
              ...old,
              messages: updatedMessages,
            };
          }
        );
      }
    );

    channel.subscribe((status) => {
      console.log(status);
      setIsConnected(status === "SUBSCRIBED");
    });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [channelId, onNewMessage]);

  return {
    isConnected,
    channel: channelRef.current,
  };
}
