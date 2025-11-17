import {
  and,
  eq,
  isNull,
  useLiveInfiniteQuery,
  useLiveSuspenseQuery,
} from "@tanstack/react-db";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  attachmentsCollection,
  messagesCollection,
  usersCollection,
} from "@/db/collections";
import { buildMessageWithAttachments } from "@/lib/communications/message";

export function useVirtualMessageThread({ messageId }: { messageId: string }) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const {
    message,
    threadMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useMessageThread({ messageId });

  const hasDoneInitialScrollRef = useRef(false);
  const prevMessageIdRef = useRef<string | null>(null);

  const loadMoreAnchorRef = useRef<{
    prevScrollHeight: number;
    prevScrollTop: number;
  } | null>(null);

  const virtualizer = useVirtualizer({
    count: threadMessages.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 160,
    overscan: 25,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    if (!messageId) return;

    if (prevMessageIdRef.current !== messageId) {
      prevMessageIdRef.current = messageId;
      hasDoneInitialScrollRef.current = false;
      loadMoreAnchorRef.current = null;
      setShowScrollButton(false);
    }
  }, [messageId]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!(messageId && el)) return;
    if (isLoading) return;
    if (threadMessages.length === 0) return;
    if (hasDoneInitialScrollRef.current) return;

    hasDoneInitialScrollRef.current = true;

    requestAnimationFrame(() => {
      virtualizer.scrollToOffset(el.scrollHeight, { align: "end" });
    });
  }, [messageId, isLoading, threadMessages.length, virtualizer]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to track message count changes
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (isFetchingNextPage) return;
    if (!loadMoreAnchorRef.current) return;

    const frameId = requestAnimationFrame(() => {
      const anchor = loadMoreAnchorRef.current;
      if (!anchor) return;

      const newScrollHeight = el.scrollHeight;
      const diff = newScrollHeight - anchor.prevScrollHeight;

      const newScrollTop = anchor.prevScrollTop + diff;

      virtualizer.scrollToOffset(newScrollTop, { align: "start" });

      loadMoreAnchorRef.current = null;
    });

    return () => cancelAnimationFrame(frameId);
  }, [isFetchingNextPage, threadMessages.length, virtualizer]);

  const handleScroll = useEffectEvent(() => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollThreshold = el.clientHeight * 0.1;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

    setShowScrollButton(distanceFromBottom > 100);

    if (!hasNextPage || isFetchingNextPage) return;
    if (loadMoreAnchorRef.current) return;

    const firstItem = virtualizer.getVirtualItems()[0];
    if (!firstItem) return;

    if (firstItem.index === 0 && el.scrollTop <= scrollThreshold) {
      loadMoreAnchorRef.current = {
        prevScrollHeight: el.scrollHeight,
        prevScrollTop: el.scrollTop,
      };

      fetchNextPage();
    }
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      handleScroll();
    };

    el.addEventListener("scroll", onScroll);

    const checkInitialScroll = () => {
      if (!el) return;
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollButton(distanceFromBottom > 100);
    };

    checkInitialScroll();

    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    requestAnimationFrame(() => {
      virtualizer.scrollToOffset(el.scrollHeight, {
        align: "end",
        behavior: "smooth",
      });
    });
  }, [virtualizer]);

  return {
    scrollRef,
    virtualizer,
    virtualItems,
    totalSize,
    message,
    threadMessages,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    showScrollButton,
    scrollToBottom,
  };
}

const PAGE_SIZE = 100;

export function useMessageThread({ messageId }: { messageId: string }) {
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

  const { pages, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useLiveInfiniteQuery(
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
              isNull(message.deletedAt)
            )
          )
          .orderBy(({ message }) => message.createdAt, "desc")
          .select(({ message, sender, attachment }) => ({
            message,
            sender,
            attachment,
          })),
      {
        pageSize: PAGE_SIZE,
        getNextPageParam: (lastPage, allPages) =>
          lastPage.length === PAGE_SIZE ? allPages.length : undefined,
      },
      [messageId]
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

  const rowsWithExtra = useMemo(() => (pages ? pages.flat() : []), [pages]);

  const threadMessages = useMemo(() => {
    const map = new Map<
      string,
      ReturnType<typeof buildMessageWithAttachments>
    >();

    for (const { message, sender, attachment } of rowsWithExtra) {
      let entry = map.get(message.id);

      if (!entry) {
        entry = buildMessageWithAttachments(message, sender);
        map.set(message.id, entry);
      }

      if (attachment) {
        entry.attachments.push(attachment);
      }
    }

    const ordered = Array.from(map.values()).sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return ordered;
  }, [rowsWithExtra]);

  return {
    message,
    threadMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  };
}
