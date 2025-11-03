import { useQuery } from "@tanstack/react-query";
import { queryUtils } from "@/utils/orpc";

export const useMentionUsers = (
  channelId: string,
  query: string,
  enabled = true
) =>
  useQuery(
    queryUtils.communication.message.searchUsers.queryOptions({
      input: {
        channelId,
        query,
        limit: 10,
      },
      enabled,
    })
  );
