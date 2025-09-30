import type { GetChannelMessagesOutputType } from "@server/lib/types";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { supabase } from "@/lib/supabase";
import { queryClient, queryUtils } from "@/utils/orpc";

interface UseMessagesOptions {
  limit?: number;
  offset?: number;
  beforeMessageId?: string;
  afterMessageId?: string;
  enableRealtime?: boolean;
}

export const useMessages = (
  channelId: string,
  options?: UseMessagesOptions
) => {
  const {
    limit = 50,
    offset = 0,
    afterMessageId,
    beforeMessageId,
  } = options || {};
  const { user } = useAuthedSession();
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel>(null);

  // Query for messages
  const {
    data: { messages = [] },
    refetch: refetchGetChannelMessages,
    isPending: isFetchingChannelMessage,
  } = useSuspenseQuery(
    queryUtils.communication.messages.getChannelMessages.queryOptions({
      input: {
        channelId,
        limit,
        offset,
        beforeMessageId: options?.beforeMessageId,
        afterMessageId: options?.afterMessageId,
      },
    })
  );

  useEffect(() => {
    const channel = supabase.channel(`org:channel:${channelId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel.on("broadcast", { event: "new-message" }, async (payload) => {
      const newMessage =
        payload.payload as unknown as GetChannelMessagesOutputType["messages"][number];
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

          return {
            ...old,
            messages: [...(old.messages || []), messageWithSender],
          };
        }
      );
    });

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
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        setIsConnected(true);
        await channel.track({
          userId: user.id,
        });
      }
    });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [user.id, channelId, limit, offset, beforeMessageId, afterMessageId]);

  // Mutation hooks
  const { mutateAsync: createMessage, isPending: isCreatingMessage } =
    useMutation(
      queryUtils.communication.messages.create.mutationOptions({
        onSuccess: async (data) => {
          const newMessage = data;
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

              return {
                ...old,
                messages: [...(old.messages || []), messageWithSender],
              };
            }
          );

          channelRef.current?.send({
            type: "broadcast",
            event: "new-message",
            payload: {
              message: data,
            },
          });
        },
      })
    );

  const {
    mutateAsync: updateMessage,
    isPending: isUpdatingMessage,
    variables: updateMessageVariables,
  } = useMutation(
    queryUtils.communication.messages.update.mutationOptions({
      onSuccess: (updatedMessage, { messageId }) => {
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
              message.id === messageId
                ? {
                    ...message,
                    ...updatedMessage,
                    isEdited: true,
                    editedAt: new Date(),
                  }
                : message
            );

            return {
              ...old,
              messages: updatedMessages,
            };
          }
        );

        channelRef.current?.send({
          type: "broadcast",
          event: "message-updated",
          payload: {
            message: {
              ...updatedMessage,
              isEdited: true,
              editedAt: new Date(),
            },
          },
        });
      },
    })
  );

  const deleteMutation = useMutation(
    queryUtils.communication.messages.delete.mutationOptions({
      onSuccess: (_data, { messageId }) => {
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
      },
    })
  );

  const { mutateAsync: addReaction, isPending: isAddingReaction } = useMutation(
    queryUtils.communication.messages.addReaction.mutationOptions({})
  );

  const { mutateAsync: removeReaction, isPending: isRemovingReaction } =
    useMutation(
      queryUtils.communication.messages.removeReaction.mutationOptions({})
    );

  return {
    messages,
    refetch: refetchGetChannelMessages,
    isFetchingChannelMessage,
    isCreatingMessage,
    isUpdatingMessage,
    updatingMessageId: updateMessageVariables?.messageId,
    isDeletingMessage: deleteMutation.isPending,
    deletingMessageId: deleteMutation.variables?.messageId,
    isAddingReaction,
    isRemovingReaction,
    isConnected,
    createMessage,
    updateMessage,
    deleteMessage: deleteMutation.mutateAsync,
    addReaction,
    removeReaction,
  };
};

export const useMessage = (messageId: string) => {
  return useQuery(
    queryUtils.communication.messages.get.queryOptions({
      input: {
        messageId,
      },
    })
  );
};

export const useTypingIndicator = (channelId: string) => {
  const { user } = useAuthedSession();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const channelRef = useRef<RealtimeChannel>(null);

  useEffect(() => {
    const channelName = `typing:${channelId}`;
    const channel = supabase
      .channel(channelName)
      .on("broadcast", { event: "typing" }, (payload) => {
        const { userId, isTyping } = payload.payload as {
          userId: string;
          isTyping: boolean;
        };

        if (isTyping) {
          setTypingUsers((prev) => {
            if (!prev.includes(userId)) {
              return [...prev, userId];
            }
            return prev;
          });
        } else {
          setTypingUsers((prev) => prev.filter((id) => id !== userId));
        }

        // Clear typing indicator after 3 seconds of inactivity
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((id) => id !== userId));
        }, 3000);
      })
      .subscribe((status) => {
        console.log(
          `Typing indicator connection status for ${channelId}: ${status}`
        );
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setTypingUsers([]);
    };
  }, [channelId]);

  const broadcastTyping = (isTyping: boolean) => {
    if (!(channelId && channelRef.current)) return;

    channelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: {
        userId: user?.id,
        isTyping,
        timestamp: new Date().toISOString(),
      },
    });
  };

  return {
    typingUsers,
    broadcastTyping,
  };
};
