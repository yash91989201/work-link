import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { queryClient, queryUtils } from "@/utils/orpc";

export const usePinnedMessagesRealtime = ({
  channelId,
}: {
  channelId: string;
}) => {
  useEffect(() => {
    const channel = supabase.channel(
      `org:channel:${channelId}:pinned-messages`
    );

    channel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message",
          filter: `channel_id=eq.${channelId}`,
        },
        () => {
          queryClient.refetchQueries({
            queryKey:
              queryUtils.communication.messages.getPinnedMessages.queryKey({
                input: {
                  channelId,
                },
              }),
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [channelId]);
};
