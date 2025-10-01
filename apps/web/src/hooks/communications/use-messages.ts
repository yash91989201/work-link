import type { GetChannelMessagesOutputType } from "@server/lib/types";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { supabase } from "@/lib/supabase";
import { queryClient, queryUtils } from "@/utils/orpc";

interface UseMessagesOptions {
  limit?: number;
  offset?: number;
  beforeMessageId?: string;
  afterMessageId?: string;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

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
        parentMessage: newMessage.parentMessageId ? await getParentMessageInfo(newMessage.parentMessageId) : undefined,
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
          const messageExists = old.messages.some((msg) => msg.id === messageWithSender.id);
          if (messageExists) {
            return old;
          }

          return {
            ...old,
            messages: [...(old.messages || []), messageWithSender],
          };
        }
      );

      setTimeout(() => scrollToBottom(), 50);
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
  }, [
    user.id,
    channelId,
    limit,
    offset,
    beforeMessageId,
    afterMessageId,
    scrollToBottom,
  ]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollToBottom(), 50);
    }
  }, [messages, scrollToBottom]);

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
            parentMessage: newMessage.parentMessageId ? await getParentMessageInfo(newMessage.parentMessageId) : undefined,
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
    messagesEndRef,
    scrollToBottom,
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
