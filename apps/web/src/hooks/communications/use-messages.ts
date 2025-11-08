import { and, eq, useLiveSuspenseQuery } from "@tanstack/react-db";
import { useCallback, useMemo, useState } from "react";
import {
  attachmentsCollection,
  messagesCollection,
  usersCollection,
} from "@/db/collections";
import { buildMessageWithAttachments } from "@/lib/communications/message";

const MESSAGES_PER_PAGE = 50;

export function useMessages({ channelId }: { channelId: string }) {
  const [loadedCount, setLoadedCount] = useState(MESSAGES_PER_PAGE);

  // Fetch messages in descending order (newest first) with limit
  const { data: rows } = useLiveSuspenseQuery(
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
        .orderBy(({ message }) => message.createdAt, "desc")
        .limit(loadedCount)
        .select(({ message, sender, attachment }) => ({
          message,
          sender,
          attachment,
        })),
    [channelId, loadedCount]
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

  // Debug: Log the count
  console.log(
    `[useMessages] Loaded ${messages.length} messages (limit: ${loadedCount})`
  );

  // Check if there might be more messages to load
  const hasMore = rows.length === loadedCount;

  const loadMore = useCallback(() => {
    if (hasMore) {
      console.log(`[useMessages] Loading more... Current: ${loadedCount}`);
      setLoadedCount((prev) => prev + MESSAGES_PER_PAGE);
    }
  }, [hasMore, loadedCount]);

  return {
    messages,
    hasMore,
    loadMore,
  };
}
