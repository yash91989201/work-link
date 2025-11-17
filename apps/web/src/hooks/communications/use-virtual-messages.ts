import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef } from "react";
import { useMessages } from "./use-messages";

export function useVirtualMessages() {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const {
    messages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useMessages();

  // Initial scroll to bottom (latest messages)
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
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  // Initial scroll to bottom (latest messages)
  useEffect(() => {
    if (isLoading || messages.length === 0) return;
    if (hasDoneInitialScrollRef.current) return;

    hasDoneInitialScrollRef.current = true;

    requestAnimationFrame(() => {
      virtualizer.scrollToIndex(messages.length - 1, { align: "end" });
    });
  }, [isLoading, messages.length, virtualizer]);

  // After older messages are fetched and rendered, restore scroll position
  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to track message count changes
  useEffect(() => {
    const el = scrollRef.current;
    const anchor = loadMoreAnchorRef.current;
    if (!(el && anchor)) return;

    // Wait until fetching is done
    if (isFetchingNextPage) return;

    requestAnimationFrame(() => {
      const newScrollHeight = el.scrollHeight;
      const diff = newScrollHeight - anchor.prevScrollHeight;

      const newScrollTop = anchor.prevScrollTop + diff;
      el.scrollTop = newScrollTop;

      // Keep virtualizer in sync with the scroll offset
      virtualizer.scrollToOffset(newScrollTop, { align: "start" });

      loadMoreAnchorRef.current = null;
    });
  }, [isFetchingNextPage, messages.length, virtualizer]);

  // Infinite scroll: load older messages when truly at the top of the virtual list
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      if (!hasNextPage || isFetchingNextPage) return;
      if (loadMoreAnchorRef.current) return; // already in process of anchoring

      const firstItem = virtualizer.getVirtualItems()[0];
      if (!firstItem) return;

      // Only trigger when the first virtual item is the first message
      // and we're near the top of the scroll container
      if (firstItem.index === 0 && el.scrollTop <= 25) {
        loadMoreAnchorRef.current = {
          prevScrollHeight: el.scrollHeight,
          prevScrollTop: el.scrollTop,
        };

        fetchNextPage();
      }
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, virtualizer]);

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
  };
}
