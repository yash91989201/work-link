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
        (payload) => {
          console.log(payload);
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
      .subscribe((status, err) => {
        console.log(status);
        console.log(err);
      });

    return () => {
      channel.unsubscribe();
    };
  }, [channelId]);
};
