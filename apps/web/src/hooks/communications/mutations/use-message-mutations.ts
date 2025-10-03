import { useMutation } from "@tanstack/react-query";
import { queryClient, queryUtils } from "@/utils/orpc";

interface UseMessageMutationsOptions {
  channelId: string;
  limit?: number;
  offset?: number;
  beforeMessageId?: string;
  afterMessageId?: string;
}

export function useMessageMutations(options: UseMessageMutationsOptions) {
  const {
    channelId,
    limit = 50,
    offset = 0,
    beforeMessageId,
    afterMessageId,
  } = options;

  const createMutation = useMutation(
    queryUtils.communication.messages.create.mutationOptions({})
  );

  const updateMutation = useMutation(
    queryUtils.communication.messages.update.mutationOptions({})
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

  const pinMutation = useMutation(
    queryUtils.communication.messages.pin.mutationOptions({
      onMutate: async ({ messageId }) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({
          queryKey:
            queryUtils.communication.messages.getChannelMessages.queryKey({
              input: {
                channelId,
                limit,
                offset,
                beforeMessageId,
                afterMessageId,
              },
            }),
        });

        // Snapshot the previous value
        const previousMessages = queryClient.getQueryData(
          queryUtils.communication.messages.getChannelMessages.queryKey({
            input: {
              channelId,
              limit,
              offset,
              beforeMessageId,
              afterMessageId,
            },
          })
        );

        // Optimistically update to the new value
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
              if (message.id !== messageId) return message;
              return {
                ...message,
                isPinned: !message.isPinned,
                pinnedAt: message.isPinned ? null : new Date(),
              };
            });

            return {
              ...old,
              messages: updatedMessages,
            };
          }
        );

        return { previousMessages };
      },
      onError: (_err, _variables, context) => {
        // Rollback on error
        if (context?.previousMessages) {
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
            context.previousMessages
          );
        }
      },
      onSuccess: (_data, { messageId }) => {
        // Update will come from realtime, but ensure it's set
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
              if (message.id !== messageId) return message;
              return {
                ...message,
                isPinned: !message.isPinned,
              };
            });

            return {
              ...old,
              messages: updatedMessages,
            };
          }
        );
      },
    })
  );

  const addReactionMutation = useMutation(
    queryUtils.communication.messages.addReaction.mutationOptions({})
  );

  const removeReactionMutation = useMutation(
    queryUtils.communication.messages.removeReaction.mutationOptions({})
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
    isPinningMessage: pinMutation.isPending,
    pinningMessageId: pinMutation.variables?.messageId,

    addReaction: addReactionMutation.mutateAsync,
    isAddingReaction: addReactionMutation.isPending,

    removeReaction: removeReactionMutation.mutateAsync,
    isRemovingReaction: removeReactionMutation.isPending,
  };
}
