import { useQuery } from "@tanstack/react-query";
import { queryUtils } from "@/utils/orpc";

export const useChannelMembers = (channelId: string) => {
  return useQuery(
    queryUtils.communication.channel.getMembers.queryOptions({
      input: {
        channelId,
      },
    })
  );
};

