import { useParams } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useMentionDetection } from "@/hooks/communications/use-mention-detection";
import { cn } from "@/lib/utils";
import { useMessageList } from "@/stores/message-list-store";
import { EmptyState } from "./empty-state";
import { MessageItem } from "./message-item";

export function MessageList({ className }: { className?: string }) {
  const { id: channelId } = useParams({
    from: "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id",
  });

  const parentRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const previousScrollHeight = useRef(0);
  const [showNewerButton, setShowNewerButton] = useState(false);

  const { messages, messagesEndRef, hasMore, loadMore } =
    useMessageList(channelId);

  useMentionDetection({ messages, channelId });

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150,
    overscan: 5,
    gap: 16,
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
        // Use a small delay to ensure DOM is rendered
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

    // When we're close to the top and have more data, load more
    if (firstItem?.index < 5 && hasMore) {
      // Store current scroll height before loading
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
      // Adjust scroll position to maintain visual position
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

      // Show button if scrolled up more than 80vh from bottom
      const threshold = window.innerHeight * 0.8;
      setShowNewerButton(distanceFromBottom > threshold);
    };

    scrollElement.addEventListener("scroll", handleScroll);
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = () => {
    const scrollElement = parentRef.current;
    if (scrollElement) {
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const hasMessages = messages.length > 0;

  if (!hasMessages) {
    return (
      <div
        className={cn(
          "flex-1 overflow-hidden bg-linear-to-b from-background via-background to-muted/10",
          className
        )}
      >
        <EmptyState />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex-1 overflow-hidden bg-linear-to-b from-background via-background to-muted/10",
        className
      )}
    >
      <div className="h-full overflow-auto" ref={parentRef}>
        <div className="flex flex-col py-4 sm:px-4">
          {hasMore && (
            <div className="flex justify-center py-2">
              <div className="text-muted-foreground text-sm">
                Loading older messages...
              </div>
            </div>
          )}
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualItems.map((virtualItem) => (
              <div
                data-index={virtualItem.index}
                key={virtualItem.key}
                ref={virtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualItem.start}px)`,
                  paddingBottom: "16px",
                }}
              >
                <MessageItem message={messages[virtualItem.index]} />
              </div>
            ))}
          </div>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {showNewerButton && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
          <Button
            className="pointer-events-auto shadow-lg"
            onClick={scrollToBottom}
            size="sm"
            type="button"
          >
            <ArrowDown className="mr-2 h-4 w-4" />
            Show newer messages
          </Button>
        </div>
      )}
    </div>
  );
}
