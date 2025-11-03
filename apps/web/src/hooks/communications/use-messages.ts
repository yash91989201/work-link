import { useSuspenseQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { queryUtils } from "@/utils/orpc";
import { useMessageMutations } from "./use-message-mutations";
import { useMessageScroll } from "./use-message-scroll";
import { useMessagesRealtime } from "./use-messages-realtime";

export function useMessages(channelId: string) {
  const {
    data: { messages = [] },
    refetch,
  } = useSuspenseQuery(
    queryUtils.communication.message.getChannelMessages.queryOptions({
      input: {
        channelId,
      },
    })
  );

  const { messagesEndRef, scrollToBottom } = useMessageScroll();

  const mutations = useMessageMutations({
    channelId,
  });

  useMessagesRealtime({
    channelId,
    onNewMessage: useCallback(() => {
      setTimeout(() => scrollToBottom(), 50);
    }, [scrollToBottom]),
  });

  return {
    messages,
    refetch,
    messagesEndRef,
    scrollToBottom,
    ...mutations,
  };
}
