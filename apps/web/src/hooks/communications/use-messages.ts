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

export function useVirtualMessages() {
  const { id: channelId } = useParams({
    from: "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id",
  });

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const {
    messages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useMessages({ channelId });

  // Track if we've done the initial scroll-to-bottom
  const hasDoneInitialScrollRef = useRef(false);

  // Anchor info for preserving scroll when loading older pages
  const loadMoreAnchorRef = useRef<{
    prevScrollHeight: number;
    prevScrollTop: number;
  } | null>(null);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 160,
    overscan: 25,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  const [showScrollButton, setShowScrollButton] = useState(false);

  // Initial scroll to bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (!(channelId && el)) return;
    if (isLoading) return;
    if (messages.length === 0) return;
    if (hasDoneInitialScrollRef.current) return;

    hasDoneInitialScrollRef.current = true;

    requestAnimationFrame(() => {
      virtualizer.scrollToOffset(el.scrollHeight, { align: "end" });
    });
  }, [channelId, isLoading, messages.length, virtualizer]);

  // After older messages are fetched and rendered, restore scroll position
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
  }, [isFetchingNextPage, messages.length, virtualizer]);

  // ✅ Stable scroll handler using useEffectEvent
  const handleScroll = useEffectEvent(() => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollThreshold = el.clientHeight * 0.1;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

    // Show button when not at the bottom (with 100px threshold)
    setShowScrollButton(distanceFromBottom > 100);

    if (!hasNextPage || isFetchingNextPage) return;
    if (loadMoreAnchorRef.current) return; // already anchoring

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

  // Infinite scroll: attach DOM listener with proper cleanup
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      handleScroll();
    };

    el.addEventListener("scroll", onScroll, { passive: true });

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
    // DOM
    scrollRef,

    // virtualization
    virtualizer,
    virtualItems,
    totalSize,

    // data
    messages,

    // status flags
    isLoading,
    isFetchingNextPage,
    hasNextPage,

    // scroll actions
    showScrollButton,
    scrollToBottom,
  };
}

const PAGE_SIZE = 100;

export function useMessages({ channelId }: { channelId: string }) {
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
              isNull(message.deletedAt),
              isNull(message.parentMessageId)
            )
          )
          .orderBy(({ message }) => message.createdAt)
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

  const messages = useMemo(() => {
    if (!pages || pages.length === 0) {
      return [];
    }

    const map = new Map<
      string,
      ReturnType<typeof buildMessageWithAttachments>
    >();

    for (const page of pages) {
      for (const { message, sender, attachment } of page) {
        if (!map.has(message.id)) {
          map.set(message.id, buildMessageWithAttachments(message, sender));
        }

        if (attachment) {
          map.get(message.id)?.attachments.push(attachment);
        }
      }
    }

    const orderedMessages = Array.from(map.values()).sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return orderedMessages;
  }, [pages]);

  return {
    messages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  };
}
