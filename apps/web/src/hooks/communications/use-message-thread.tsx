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

export function useMessageThread({ messageId }: { messageId: string }) {
  const [loadedCount, setLoadedCount] = useState(MESSAGES_PER_PAGE);
  const { messagesEndRef } = useMessageScroll();

  const { data: messageRows } = useLiveSuspenseQuery(
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
          and(eq(message.id, messageId), eq(message.isDeleted, false))
        )
        .select(({ message, sender, attachment }) => ({
          message,
          sender,
          attachment,
        })),
    [messageId]
  );

  const { data: threadRowsWithExtra } = useLiveSuspenseQuery(
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
          and(
            eq(message.parentMessageId, messageId),
            eq(message.isDeleted, false)
          )
        )
        .orderBy(({ message }) => message.createdAt)
        .limit(loadedCount + 1)
        .select(({ message, sender, attachment }) => ({
          message,
          sender,
          attachment,
        })),
    [messageId, loadedCount]
  );

  const message = useMemo(() => {
    if (!messageRows.length) return;

    const messageMap = new Map<
      string,
      ReturnType<typeof buildMessageWithAttachments>
    >();

    for (const { message, sender, attachment } of messageRows) {
      let entry = messageMap.get(message.id);
      if (!entry) {
        entry = buildMessageWithAttachments(message, sender);
        messageMap.set(message.id, entry);
      }
      if (attachment) {
        entry.attachments.push(attachment);
      }
    }

    return Array.from(messageMap.values())[0];
  }, [messageRows]);

  const hasMore = threadRowsWithExtra.length > loadedCount;

  const threadRows = useMemo(
    () =>
      hasMore ? threadRowsWithExtra.slice(0, loadedCount) : threadRowsWithExtra,
    [threadRowsWithExtra, hasMore, loadedCount]
  );

  const threadMessagesMap = useMemo(() => {
    const map = new Map<
      string,
      ReturnType<typeof buildMessageWithAttachments>
    >();

    for (const { message, sender, attachment } of threadRows) {
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
  }, [threadRows]);

  const threadMessages = useMemo(
    () => Array.from(threadMessagesMap.values()),
    [threadMessagesMap]
  );

  const loadMore = useCallback(() => {
    if (hasMore) {
      setLoadedCount((prev) => prev + MESSAGES_PER_PAGE);
    }
  }, [hasMore]);

  return {
    message,
    threadMessages,
    messagesEndRef,
    hasMore,
    loadMore,
  };
}
