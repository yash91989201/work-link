import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryUtils } from "@/utils/orpc";
import { useMessagesQuery } from "./queries/use-messages-query";
import { useMessageMutations } from "./mutations/use-message-mutations";
import { useMessagesRealtime } from "./realtime/use-messages-realtime";
import { useMessageScroll } from "./features/use-message-scroll";

interface UseMessagesOptions {
  limit?: number;
  offset?: number;
  beforeMessageId?: string;
  afterMessageId?: string;
}

/**
 * Main hook for managing messages in a channel
 * Composes multiple smaller hooks for better separation of concerns
 */
export function useMessages(channelId: string, options?: UseMessagesOptions) {
  const { limit = 50, offset = 0, afterMessageId, beforeMessageId } = options || {};

  // Data fetching
  const { messages, refetch, isLoading: isFetchingChannelMessage } = useMessagesQuery(
    channelId,
    { limit, offset, afterMessageId, beforeMessageId }
  );

  // Scroll behavior
  const { messagesEndRef, scrollToBottom } = useMessageScroll();

  // CRUD operations
  const mutations = useMessageMutations({
    channelId,
    limit,
    offset,
    beforeMessageId,
    afterMessageId,
  });

  // Realtime subscriptions
  const { isConnected } = useMessagesRealtime({
    channelId,
    limit,
    offset,
    beforeMessageId,
    afterMessageId,
    onNewMessage: useCallback(() => {
      setTimeout(() => scrollToBottom(), 50);
    }, [scrollToBottom]),
  });

  return {
    // Data
    messages,
    refetch,
    isFetchingChannelMessage,
    isConnected,

    // Scroll
    messagesEndRef,
    scrollToBottom,

    // Mutations
    ...mutations,
  };
}

export function useMessage(messageId: string) {
  return useQuery(
    queryUtils.communication.messages.get.queryOptions({
      input: {
        messageId,
      },
    })
  );
}

// Re-export realtime hooks
export { useTypingIndicator } from "./realtime/use-typing-indicator";
