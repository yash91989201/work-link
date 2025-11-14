import { and, eq, useLiveSuspenseQuery } from "@tanstack/react-db";
import { useCallback, useMemo, useState } from "react";
import {
  attachmentsCollection,
  messagesCollection,
  usersCollection,
} from "@/db/collections";
import { buildMessageWithAttachments } from "@/lib/communications/message";
import { useMessageScroll } from "./use-message-scroll";

const MESSAGES_PER_PAGE = 50;

export function useMessages({ channelId }: { channelId: string }) {
  const [loadedCount, setLoadedCount] = useState(MESSAGES_PER_PAGE);
  const { messagesEndRef } = useMessageScroll();

  const { data: rowsWithExtra } = useLiveSuspenseQuery(
    (q) =>
      q
        .from({ message: messagesCollection })
        .innerJoin({ sender: usersCollection }, ({ message, sender }) =>
          eq(message.senderId, sender.id)
        )
        .leftJoin(
          { attachment: attachmentsCollection },
          ({ message, attachment }) => eq(attachment.messageId, message.id)
        )
        .where(({ message }) =>
          and(eq(message.channelId, channelId), eq(message.isDeleted, false))
        )
        .orderBy(({ message }) => message.createdAt)
        .limit(loadedCount + 1)
        .select(({ message, sender, attachment }) => ({
          message,
          sender,
          attachment,
        })),
    [channelId, loadedCount]
  );

  const hasMore = rowsWithExtra.length > loadedCount;

  const rows = useMemo(
    () => (hasMore ? rowsWithExtra.slice(0, loadedCount) : rowsWithExtra),
    [rowsWithExtra, hasMore, loadedCount]
  );

  const messagesMap = useMemo(() => {
    const map = new Map<
      string,
      ReturnType<typeof buildMessageWithAttachments>
    >();

    for (const { message, sender, attachment } of rows) {
      let entry = map.get(message.id);
      if (!entry) {
        entry = buildMessageWithAttachments(message, sender);
        map.set(message.id, entry);
      }
      if (attachment) {
        entry.attachments.push(attachment);
      }
    }

    return map;
  }, [rows]);

  const messages = useMemo(
    () => Array.from(messagesMap.values()),
    [messagesMap]
  );

  const loadMore = useCallback(() => {
    if (hasMore) {
      setLoadedCount((prev) => prev + MESSAGES_PER_PAGE);
    }
  }, [hasMore]);

  return {
    messages,
    messagesEndRef,
    hasMore,
    loadMore,
  };
}
