import type { MessageTypeType, MessageWithSenderType } from "@server/lib/types";
import { useMutation } from "@tanstack/react-query";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { getRealtimeChannel } from "@/utils/channel";
import { queryClient, queryUtils } from "@/utils/orpc";

export function useMessageMutations({ channelId }: { channelId: string }) {
  const { user } = useAuthedSession();

  const queryKey =
    queryUtils.communication.messages.getChannelMessages.queryKey({
      input: { channelId },
    });

  const createMutation = useMutation(
    queryUtils.communication.messages.create.mutationOptions({
      onMutate: async (newMessageData) => {
        await queryClient.cancelQueries({ queryKey });
        const previousMessages = queryClient.getQueryData(queryKey);

        const optimisticMessage: MessageWithSenderType = {
          id: `temp-${Date.now()}-${Math.random()}`,
          channelId: newMessageData.channelId ?? null,
          receiverId: newMessageData.receiverId ?? null,
          content: newMessageData.content ?? null,
          type: newMessageData.type as MessageTypeType,
          mentions: newMessageData.mentions ?? null,
          parentMessageId: newMessageData.parentMessageId ?? null,
          senderId: user.id,
          sender: {
            name: user.name,
            email: user.email,
            image: user.image ?? null,
          },
          isPinned: false,
          isEdited: false,
          isDeleted: false,
          reactions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          editedAt: null,
          deletedAt: null,
          pinnedAt: null,
          pinnedBy: null,
          threadCount: 0,
        };

        queryClient.setQueryData(queryKey, (old) => {
          if (!old) return old;

          return {
            messages: [...(old.messages || []), optimisticMessage],
          };
        });

        return { previousMessages, optimisticMessage };
      },
      onError: (_error, _variables, context) => {
        if (context?.previousMessages) {
          queryClient.setQueryData(queryKey, context.previousMessages);
        }
      },
      onSuccess: async (serverMessage, _variables, context) => {
        queryClient.setQueryData(queryKey, (old) => {
          if (!old) return old;

          return {
            messages: old.messages.map((msg) =>
              msg.id === context?.optimisticMessage?.id
                ? {
                    ...serverMessage,
                    sender: {
                      name: user.name,
                      email: user.email,
                      image: user.image ?? null,
                    },
                  }
                : msg
            ),
          };
        });

        const channel = getRealtimeChannel(channelId);

        await channel.send({
          type: "broadcast",
          event: "new-message",
          payload: {
            message: {
              ...serverMessage,
              sender: {
                name: user.name,
                email: user.email,
                image: user.image ?? null,
              },
            },
          },
        });
      },
    })
  );

  const updateMutation = useMutation(
    queryUtils.communication.messages.update.mutationOptions({
      onMutate: async ({ messageId, content, mentions }) => {
        await queryClient.cancelQueries({ queryKey });
        const previousMessages = queryClient.getQueryData(queryKey);

        queryClient.setQueryData(queryKey, (old) => {
          if (!old) return old;

          return {
            messages: old.messages.map((message) => {
              if (message.id !== messageId) return message;

              return {
                ...message,
                content: content ?? null,
                mentions: mentions ?? null,
                isEdited: true,
                editedAt: new Date(),
              };
            }),
          };
        });

        return { previousMessages };
      },
      onError: (_error, _variables, context) => {
        if (context?.previousMessages) {
          queryClient.setQueryData(queryKey, context.previousMessages);
        }
      },
      onSuccess: async (serverMessage) => {
        queryClient.setQueryData(queryKey, (old) => {
          if (!old) return old;

          const updatedMessages = old.messages.map((message) => {
            if (message.id === serverMessage.id) {
              return {
                ...message,
                ...serverMessage,
                sender: {
                  ...serverMessage.sender,
                  image: serverMessage.sender.image ?? null,
                },
              };
            }

            return message;
          });

          return {
            messages: updatedMessages,
          };
        });

        const channel = getRealtimeChannel(channelId);

        await channel.send({
          type: "broadcast",
          event: "message-updated",
          payload: {
            message: serverMessage,
          },
        });
      },
    })
  );

  const deleteMutation = useMutation(
    queryUtils.communication.messages.delete.mutationOptions({
      onMutate: async ({ messageId }) => {
        await queryClient.cancelQueries({ queryKey });
        const previousMessages = queryClient.getQueryData(queryKey);

        queryClient.setQueryData(queryKey, (old) => {
          if (!old) return old;
          return {
            messages: old.messages.filter((msg) => msg.id !== messageId),
          };
        });

        return { previousMessages, messageId };
      },
      onError: (_error, _variables, context) => {
        if (context?.previousMessages) {
          queryClient.setQueryData(queryKey, context.previousMessages);
        }
      },
      onSuccess: async (_data, _variables, context) => {
        const channel = getRealtimeChannel(channelId);

        await channel.send({
          type: "broadcast",
          event: "message-deleted",
          payload: {
            messageId: context?.messageId,
          },
        });
      },
    })
  );

  const pinMutation = useMutation(
    queryUtils.communication.messages.pin.mutationOptions({
      onMutate: async ({ messageId }) => {
        await queryClient.cancelQueries({ queryKey });
        const previousMessages = queryClient.getQueryData(queryKey);

        queryClient.setQueryData(queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            messages: old.messages.map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    isPinned: true,
                    pinnedAt: new Date(),
                    _optimistic: true,
                  }
                : msg
            ),
          };
        });

        const channel = getRealtimeChannel(channelId);

        await channel.send({
          type: "broadcast",
          event: "message-pinned",
          payload: {
            messageId,
          },
        });

        return { previousMessages };
      },
      onError: (_error, _variables, context) => {
        if (context?.previousMessages) {
          queryClient.setQueryData(queryKey, context.previousMessages);
        }
      },
    })
  );

  const unpinMutation = useMutation(
    queryUtils.communication.messages.unPin.mutationOptions({
      onMutate: async ({ messageId }) => {
        await queryClient.cancelQueries({ queryKey });
        const previousMessages = queryClient.getQueryData(queryKey);

        queryClient.setQueryData(queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            messages: old.messages.map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    isPinned: false,
                    pinnedAt: null,
                    pinnedBy: null,
                    _optimistic: true,
                  }
                : msg
            ),
          };
        });

        const channel = getRealtimeChannel(channelId);

        await channel.send({
          type: "broadcast",
          event: "message-unpinned",
          payload: {
            messageId,
          },
        });

        return { previousMessages };
      },
      onError: (_error, _variables, context) => {
        if (context?.previousMessages) {
          queryClient.setQueryData(queryKey, context.previousMessages);
        }
      },
    })
  );

  return {
    createMessage: createMutation.mutateAsync,
    isCreatingMessage: createMutation.isPending,
    createMessageVariables: createMutation.variables,

    updateMessage: updateMutation.mutateAsync,
    isUpdatingMessage: updateMutation.isPending,
    updatingMessageId: updateMutation.variables?.messageId,

    deleteMessage: deleteMutation.mutateAsync,
    isDeletingMessage: deleteMutation.isPending,
    deletingMessageId: deleteMutation.variables?.messageId,

    pinMessage: pinMutation.mutateAsync,
    unpinMessage: unpinMutation.mutateAsync,
    isPinningMessage: pinMutation.isPending || unpinMutation.isPending,
    pinningMessageId:
      pinMutation.variables?.messageId || unpinMutation.variables?.messageId,
  };
}
