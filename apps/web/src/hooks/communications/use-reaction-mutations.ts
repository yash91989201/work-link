import { useMutation } from "@tanstack/react-query";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { getRealtimeChannel } from "@/utils/channel";
import { queryClient, queryUtils } from "@/utils/orpc";

export function useReactionMutations({ channelId }: { channelId: string }) {
  const { user } = useAuthedSession();

  const queryKey = queryUtils.communication.message.getChannelMessages.queryKey(
    {
      input: { channelId },
    }
  );

  const addReactionMutation = useMutation(
    queryUtils.communication.message.addReaction.mutationOptions({
      onMutate: async ({ messageId, emoji }) => {
        await queryClient.cancelQueries({ queryKey });
        const previousMessages = queryClient.getQueryData(queryKey);

        queryClient.setQueryData(queryKey, (old) => {
          if (!old) return old;

          return {
            ...old,
            messages: old.messages.map((msg) => {
              if (msg.id !== messageId) return msg;

              const reactions = msg.reactions || [];
              const userReaction = reactions.find(
                (r) => r.reaction === emoji && r.userId === user.id
              );

              if (userReaction) return msg;

              return {
                ...msg,
                reactions: [
                  ...reactions,
                  {
                    reaction: emoji,
                    userId: user.id,
                    createdAt: new Date().toISOString(),
                  },
                ],
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
      onSuccess: async (_data, { messageId, emoji }) => {
        const channel = getRealtimeChannel(channelId);

        await channel.send({
          type: "broadcast",
          event: "reaction-added",
          payload: {
            messageId,
            emoji,
            userId: user.id,
          },
        });
      },
    })
  );

  const removeReactionMutation = useMutation(
    queryUtils.communication.message.removeReaction.mutationOptions({
      onMutate: async ({ messageId, emoji }) => {
        await queryClient.cancelQueries({ queryKey });
        const previousMessages = queryClient.getQueryData(queryKey);

        queryClient.setQueryData(queryKey, (old) => {
          if (!old) return old;

          return {
            ...old,
            messages: old.messages.map((msg) => {
              if (msg.id !== messageId) return msg;

              const reactions = (msg.reactions || []).filter(
                (r) => !(r.reaction === emoji && r.userId === user.id)
              );

              return {
                ...msg,
                reactions,
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
      onSuccess: async (_data, { messageId, emoji }) => {
        const channel = getRealtimeChannel(channelId);

        await channel.send({
          type: "broadcast",
          event: "reaction-removed",
          payload: {
            messageId,
            emoji,
            userId: user.id,
          },
        });
      },
    })
  );

  return {
    addReaction: addReactionMutation.mutateAsync,
    removeReaction: removeReactionMutation.mutateAsync,
    isAddingReaction: addReactionMutation.isPending,
    isRemovingReaction: removeReactionMutation.isPending,
  };
}
