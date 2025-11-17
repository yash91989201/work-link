import { and, eq, isNull, useLiveInfiniteQuery } from "@tanstack/react-db";
import { useParams } from "@tanstack/react-router";
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

export function useVirtualPinnedMessages() {
  const { id: channelId } = useParams({
    from: "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id",
  });

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const {
    pinnedMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = usePinnedMessages({ channelId });

  const hasDoneInitialScrollRef = useRef(false);
  const prevChannelIdRef = useRef<string | null>(null);

  const loadMoreAnchorRef = useRef<{
    prevScrollHeight: number;
    prevScrollTop: number;
  } | null>(null);

  const virtualizer = useVirtualizer({
    count: pinnedMessages.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 160,
    overscan: 25,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    if (!channelId) return;

    if (prevChannelIdRef.current !== channelId) {
      prevChannelIdRef.current = channelId;
      hasDoneInitialScrollRef.current = false;
      loadMoreAnchorRef.current = null;
      setShowScrollButton(false);
    }
  }, [channelId]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!(channelId && el)) return;
    if (isLoading) return;
    if (pinnedMessages.length === 0) return;
    if (hasDoneInitialScrollRef.current) return;

    hasDoneInitialScrollRef.current = true;

    requestAnimationFrame(() => {
      virtualizer.scrollToOffset(0, { align: "start" });
    });
  }, [channelId, isLoading, pinnedMessages.length, virtualizer]);

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
  }, [isFetchingNextPage, pinnedMessages.length, virtualizer]);

  const handleScroll = useEffectEvent(() => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollThreshold = el.clientHeight * 0.1;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

    setShowScrollButton(distanceFromBottom > 100);

    if (!hasNextPage || isFetchingNextPage) return;
    if (loadMoreAnchorRef.current) return;

    const lastItem =
      virtualizer.getVirtualItems()[virtualizer.getVirtualItems().length - 1];
    if (!lastItem) return;

    if (
      lastItem.index === pinnedMessages.length - 1 &&
      distanceFromBottom <= scrollThreshold
    ) {
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
    pinnedMessages,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    showScrollButton,
    scrollToBottom,
  };
}

const PAGE_SIZE = 100;

export function usePinnedMessages({ channelId }: { channelId: string }) {
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
              eq(message.channelId, channelId),
              eq(message.isPinned, true),
              isNull(message.deletedAt)
            )
          )
          .orderBy(({ message }) => message.pinnedAt, "desc")
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
      [channelId]
    );

  const rowsWithExtra = useMemo(() => (pages ? pages.flat() : []), [pages]);

  const pinnedMessages = useMemo(() => {
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
        new Date(b.pinnedAt ?? 0).getTime() -
        new Date(a.pinnedAt ?? 0).getTime()
    );

    return ordered;
  }, [rowsWithExtra]);

  return {
    pinnedMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  };
}
