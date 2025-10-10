import { useMutation } from "@tanstack/react-query";
import { queryClient, queryUtils } from "@/utils/orpc";

export function useMessageMutations({ channelId }: { channelId: string }) {
  const createMutation = useMutation(
    queryUtils.communication.messages.create.mutationOptions({})
  );

  const updateMutation = useMutation(
    queryUtils.communication.messages.update.mutationOptions({})
  );

  const deleteMutation = useMutation(
    queryUtils.communication.messages.delete.mutationOptions({})
  );

  const pinMutation = useMutation(
    queryUtils.communication.messages.pin.mutationOptions({})
  );

  const unpinMutation = useMutation(
    queryUtils.communication.messages.unPin.mutationOptions({})
  );

  const addReactionMutation = useMutation(
    queryUtils.communication.messages.addReaction.mutationOptions({
      onSuccess: (_data, { messageId }) => {
        queryClient.setQueryData(
          queryUtils.communication.messages.getChannelMessages.queryKey({
            input: {
              channelId,
            },
          }),
          (old) => {
            if (!old) return old;

            const updatedMessages = old.messages.map((message) => {
              if (message.id !== messageId) return message;
              return {
                ...message,
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

  const removeReactionMutation = useMutation(
    queryUtils.communication.messages.removeReaction.mutationOptions({
      onSuccess: (_data, { messageId }) => {
        queryClient.setQueryData(
          queryUtils.communication.messages.getChannelMessages.queryKey({
            input: {
              channelId,
            },
          }),
          (old) => {
            if (!old) return old;

            const updatedMessages = old.messages.map((message) => {
              if (message.id !== messageId) return message;
              return {
                ...message,
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

    addReaction: addReactionMutation.mutateAsync,
    isAddingReaction: addReactionMutation.isPending,

    removeReaction: removeReactionMutation.mutateAsync,
    isRemovingReaction: removeReactionMutation.isPending,
  };
}
