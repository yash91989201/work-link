import { useEffect } from "react";
import { getRealtimeChannel } from "@/utils/channel";
import { queryClient, queryUtils } from "@/utils/orpc";

export const usePinnedMessagesRealtime = ({
  channelId,
}: {
  channelId: string;
}) => {
  useEffect(() => {
    const channel = getRealtimeChannel(channelId);
    channel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          console.log(payload);
          queryClient.refetchQueries({
            queryKey:
              queryUtils.communication.message.getPinnedMessages.queryKey({
                input: {
                  channelId,
                },
              }),
          });
        }
      )
      .subscribe();
  }, [channelId]);
};
