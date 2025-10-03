import { useSuspenseQuery } from "@tanstack/react-query";
import { queryUtils } from "@/utils/orpc";

interface UseMessagesQueryOptions {
  limit?: number;
  offset?: number;
  beforeMessageId?: string;
  afterMessageId?: string;
}

export function useMessagesQuery(
  channelId: string,
  options?: UseMessagesQueryOptions
) {
  const {
    limit = 50,
    offset = 0,
    afterMessageId,
    beforeMessageId,
  } = options || {};

  const {
    data: { messages = [] },
    refetch,
    isPending: isLoading,
  } = useSuspenseQuery(
    queryUtils.communication.messages.getChannelMessages.queryOptions({
      input: {
        channelId,
        limit,
        offset,
        beforeMessageId,
        afterMessageId,
      },
    })
  );

  return {
    messages,
    refetch,
    isLoading,
  };
}
