import type { MessageWithSenderType } from "@work-link/api/lib/types";
import { useEffect, useRef } from "react";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { useMessageListActions } from "@/stores/message-list-store";

interface UseMentionDetectionOptions {
  messages: MessageWithSenderType[];
  channelId: string;
}

export function useMentionDetection({
  messages,
  channelId,
}: UseMentionDetectionOptions) {
  const { user } = useAuthedSession();
  const { setMentionMessage } = useMessageListActions();
  const processedMessageIds = useRef(new Set<string>());

  useEffect(() => {
    if (!user?.id || messages.length === 0) return;

    for (const message of messages) {
      if (processedMessageIds.current.has(message.id)) {
        continue;
      }

      processedMessageIds.current.add(message.id);

      if (message.senderId === user.id) {
        continue;
      }

      const mentionedUserIds = message.mentions ?? [];

      if (mentionedUserIds.includes(user.id)) {
        // Track the mention but don't auto-open sidebar
        setMentionMessage(message.id);
        break;
      }
    }
  }, [messages, user?.id, setMentionMessage]);

  useEffect(() => {
    processedMessageIds.current.clear();
  }, [channelId]);
}
