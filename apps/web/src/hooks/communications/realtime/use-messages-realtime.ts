import type { GetChannelMessagesOutputType } from "@server/lib/types";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { supabase } from "@/lib/supabase";
import { queryClient, queryUtils } from "@/utils/orpc";

interface UseMessagesRealtimeOptions {
  channelId: string;
  limit?: number;
  offset?: number;
  beforeMessageId?: string;
  afterMessageId?: string;
  onNewMessage?: () => void;
  onMessageUpdated?: () => void;
  onMessageDeleted?: () => void;
}

const getParentMessageInfo = async (parentMessageId: string) => {
  const { data: parentMessage } = await supabase
    .from("message")
    .select(`
      id,
      content,
      senderId,
      sender:senderId (
        name,
        email,
        image
      )
    `)
    .eq("id", parentMessageId)
    .single();

  return parentMessage;
};

export function useMessagesRealtime(options: UseMessagesRealtimeOptions) {
  const {
    channelId,
    limit = 50,
    offset = 0,
    beforeMessageId,
    afterMessageId,
    onNewMessage,
    onMessageUpdated,
    onMessageDeleted,
  } = options;

  const { user } = useAuthedSession();
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const channel = supabase.channel(`org:channel:${channelId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Handle new messages
    channel.on("broadcast", { event: "new-message" }, async (payload) => {
      const payloadMessage = payload.payload
        .message as unknown as GetChannelMessagesOutputType["messages"][number];

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

      const { data: sender } = await supabase
        .from("user")
        .select("name, email, image")
        .eq("id", newMessage.senderId)
        .single();

      if (!sender) {
        return;
      }

      const messageWithSender = {
        ...newMessage,
        sender,
        parentMessage: newMessage.parentMessageId
          ? await getParentMessageInfo(newMessage.parentMessageId)
          : undefined,
      };

      queryClient.setQueryData(
        queryUtils.communication.messages.getChannelMessages.queryKey({
          input: {
            channelId,
            limit,
            offset,
            beforeMessageId,
            afterMessageId,
          },
        }),
        (old) => {
          if (!old) return;

          // Check if message already exists to prevent duplication
          const messageExists = old.messages.some(
            (msg) => msg.id === messageWithSender.id
          );
          if (messageExists) {
            return old;
          }

          return {
            ...old,
            messages: [...(old.messages || []), messageWithSender],
          };
        }
      );

      onNewMessage?.();
    });

    // Handle message updates
    channel.on("broadcast", { event: "message-updated" }, (payload) => {
      const updatedMessage =
        payload.payload as unknown as GetChannelMessagesOutputType["messages"][number];

      queryClient.setQueryData(
        queryUtils.communication.messages.getChannelMessages.queryKey({
          input: {
            channelId,
            limit,
            offset,
            beforeMessageId,
            afterMessageId,
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

      onMessageUpdated?.();
    });

    // Handle message deletions
    channel.on("broadcast", { event: "message-deleted" }, (payload) => {
      const { messageId } = payload.payload as { messageId: string };

      queryClient.setQueryData(
        queryUtils.communication.messages.getChannelMessages.queryKey({
          input: {
            channelId,
            limit,
            offset,
            beforeMessageId,
            afterMessageId,
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

      onMessageDeleted?.();
    });

    // Listen to postgres changes for realtime updates (pin/unpin, etc.)
    channel.on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "message",
        filter: `channel_id=eq.${channelId}`,
      },
      (payload) => {
        const updatedMessage = payload.new as any;

        queryClient.setQueryData(
          queryUtils.communication.messages.getChannelMessages.queryKey({
            input: {
              channelId,
              limit,
              offset,
              beforeMessageId,
              afterMessageId,
            },
          }),
          (old) => {
            if (!old) return old;

            const updatedMessages = old.messages.map((message) => {
              if (message.id !== updatedMessage.id) return message;

              return {
                ...message,
                isPinned: updatedMessage.is_pinned,
                pinnedAt: updatedMessage.pinned_at
                  ? new Date(updatedMessage.pinned_at)
                  : null,
                isEdited: updatedMessage.is_edited,
                editedAt: updatedMessage.edited_at
                  ? new Date(updatedMessage.edited_at)
                  : null,
                content: updatedMessage.content,
              };
            });

            return {
              ...old,
              messages: updatedMessages,
            };
          }
        );

        onMessageUpdated?.();
      }
    );

    channel.subscribe((status) => {
      console.log(
        `Message realtime connection status for ${channelId}: ${status}`
      );
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
  }, [
    channelId,
    limit,
    offset,
    beforeMessageId,
    afterMessageId,
    user.id,
    onNewMessage,
    onMessageUpdated,
    onMessageDeleted,
  ]);

  return {
    isConnected,
    channel: channelRef.current,
  };
}
