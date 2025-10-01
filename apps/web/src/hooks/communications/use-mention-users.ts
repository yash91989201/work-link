import { useQuery } from "@tanstack/react-query";
import { queryUtils } from "@/utils/orpc";

export const useMentionUsers = (
  channelId: string,
  query: string,
  enabled = true
) => {
  return useQuery(
    queryUtils.communication.messages.searchUsers.queryOptions({
      input: {
        channelId,
        query: query || "", // Send empty string if query is empty to show all users
        limit: 10,
      },
      enabled: enabled,
    })
  );
};

