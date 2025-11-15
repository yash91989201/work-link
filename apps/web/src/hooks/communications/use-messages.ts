import { and, eq, isNull, useLiveSuspenseQuery } from "@tanstack/react-db";
import { useParams } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  attachmentsCollection,
  messagesCollection,
  usersCollection,
} from "@/db/collections";
import { buildMessageWithAttachments } from "@/lib/communications/message";
import { useMessageScroll } from "./use-message-scroll";

const MESSAGES_PER_PAGE = 50;

export function useMessages() {
  const isInitialMount = useRef(true);
  const previousScrollHeight = useRef(0);
  const parentRef = useRef<HTMLDivElement>(null);

  const [showNewerButton, setShowNewerButton] = useState(false);
  const [loadedCount, setLoadedCount] = useState(MESSAGES_PER_PAGE);

  const { id: channelId } = useParams({
    from: "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id",
  });

  const { messagesEndRef, scrollToBottom } = useMessageScroll();

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
          and(
            eq(message.channelId, channelId),
            eq(message.isDeleted, false),
            isNull(message.parentMessageId)
          )
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

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150,
    overscan: 5,
    gap: 12,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Reset scroll helpers when switching channels so each thread re-inits cleanly
  useEffect(() => {
    isInitialMount.current = true;
    previousScrollHeight.current = 0;
  }, []);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (isInitialMount.current && messages.length > 0) {
      const scrollElement = parentRef.current;
      if (scrollElement) {
        setTimeout(() => {
          scrollElement.scrollTop = scrollElement.scrollHeight;
          isInitialMount.current = false;
        }, 100);
      }
    }
  }, [messages.length]);

  // Load more when scrolling near the top
  useEffect(() => {
    if (isInitialMount.current) return;

    const scrollElement = parentRef.current;
    if (!scrollElement || virtualItems.length === 0) return;

    const [firstItem] = virtualItems;

    if (firstItem?.index < 5 && hasMore) {
      previousScrollHeight.current = scrollElement.scrollHeight;
      loadMore();
    }
  }, [virtualItems, hasMore, loadMore]);

  // Restore scroll position after loading older messages
  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to track message count changes
  useEffect(() => {
    const scrollElement = parentRef.current;
    if (!scrollElement || isInitialMount.current) return;

    const currentScrollHeight = scrollElement.scrollHeight;
    const heightDifference = currentScrollHeight - previousScrollHeight.current;

    if (heightDifference > 0) {
      scrollElement.scrollTop += heightDifference;
      previousScrollHeight.current = currentScrollHeight;
    }
  }, [messages.length]);

  // Track scroll position to show "newer messages" button
  useEffect(() => {
    const scrollElement = parentRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      const threshold = window.innerHeight * 0.8;
      setShowNewerButton(distanceFromBottom > threshold);
    };

    scrollElement.addEventListener("scroll", handleScroll);
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, []);

  return {
    messages,
    messagesEndRef,
    hasMore,
    loadMore,
    parentRef,
    virtualizer,
    virtualItems,
    showNewerButton,
    scrollToBottom,
  };
}
