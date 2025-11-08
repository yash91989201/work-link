import { useParams } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CornerUpLeft } from "lucide-react";
import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useMessageList } from "@/stores/message-list-store";
import { EmptyState } from "./empty-state";
import { MessageItem } from "./message-item";

export function MessageList({ className }: { className?: string }) {
  const { id: channelId } = useParams({
    from: "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id",
  });
  const { orderedMessages, messagesEndRef, hasMore, loadMore } =
    useMessageList(channelId);

  const parentRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const previousScrollHeight = useRef(0);

  const virtualizer = useVirtualizer({
    count: orderedMessages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150,
    overscan: 5,
    gap: 16,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Scroll to bottom on initial load
  useEffect(() => {
    if (isInitialMount.current && orderedMessages.length > 0) {
      const scrollElement = parentRef.current;
      if (scrollElement) {
        console.log(
          `[MessageList] Initial load: ${orderedMessages.length} messages`
        );
        console.log(
          "[MessageList] First message date:",
          orderedMessages[0]?.createdAt
        );
        console.log(
          "[MessageList] Last message date:",
          orderedMessages[orderedMessages.length - 1]?.createdAt
        );

        // Use a small delay to ensure DOM is rendered
        setTimeout(() => {
          scrollElement.scrollTop = scrollElement.scrollHeight;
          console.log(
            `[MessageList] Scrolled to bottom: ${scrollElement.scrollHeight}px`
          );
          isInitialMount.current = false;
        }, 100);
      }
    }
  }, [orderedMessages.length]);

  // Load more when scrolling near the top
  useEffect(() => {
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
  }, [orderedMessages.length]);

  const hasMessages = orderedMessages.length > 0;

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
        "flex-1 overflow-hidden bg-linear-to-b from-background via-background to-muted/10",
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
                <MessageItem message={orderedMessages[virtualItem.index]} />
              </div>
            ))}
          </div>
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}

type AttachmentSkeletonType = "media" | "file" | "audio";

type MessageSkeletonProps = {
  showParentPreview?: boolean;
  isReply?: boolean;
  showReplyBadge?: boolean;
  showEditedBadge?: boolean;
  showPinnedBadge?: boolean;
  showThreadBadge?: boolean;
  showThreadSummary?: boolean;
  attachments?: AttachmentSkeletonType[];
  contentLines?: number;
  showActions?: boolean;
};

const renderAttachmentSkeleton = (
  type: AttachmentSkeletonType,
  index: number
) => {
  switch (type) {
    case "media":
      return (
        <div
          className="group relative max-w-md overflow-hidden rounded-lg border shadow-sm"
          key={`${type}-${index.toString()}`}
        >
          <Skeleton className="h-40 w-full" />
        </div>
      );
    case "audio":
      return (
        <div
          className="flex w-full max-w-md items-center gap-3 rounded-lg border bg-background p-3 shadow-sm"
          key={`${type}-${index.toString()}`}
        >
          <div className="flex size-9 items-center justify-center rounded-full bg-muted" />
          <div className="flex-1">
            <div className="mb-1 h-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary/40" />
            </div>
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      );
    default:
      return (
        <div
          className="flex w-fit max-w-sm items-center gap-2 rounded-lg border bg-background p-2.5 shadow-sm transition-colors"
          key={`${type}-${index.toString()}`}
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10" />
          <div className="min-w-0 flex-1 space-y-1">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="h-8 w-8 rounded-md bg-muted" />
        </div>
      );
  }
};

const MessageActionSkeleton = () => (
  <div className="pointer-events-none absolute top-2 right-3 z-10 flex items-center gap-0.5 rounded-lg border bg-popover/95 p-1 opacity-0 shadow-md backdrop-blur transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 supports-backdrop-filter:bg-popover/75">
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        className="size-7 rounded-md border border-border/60 bg-muted/40"
        key={index.toString()}
      />
    ))}
  </div>
);

const MessageSkeleton = ({
  showParentPreview = false,
  isReply = false,
  showReplyBadge = false,
  showEditedBadge = false,
  showPinnedBadge = false,
  showThreadBadge = false,
  attachments = [],
  contentLines = 3,
  showActions = true,
}: MessageSkeletonProps) => (
  <div
    className={cn(
      "group relative rounded-lg px-4 transition-colors hover:bg-muted/30",
      isReply
        ? "ml-2 border-primary/20 border-l-2 bg-muted/10 py-2.5 pl-4"
        : "py-2"
    )}
  >
    {showParentPreview && (
      <button
        className="mb-2 flex items-start gap-2 rounded-lg border-primary/40 border-l-2 bg-muted/40 py-1.5 pr-3 pl-2 text-left transition hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        type="button"
      >
        <CornerUpLeft className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1 space-y-1">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
      </button>
    )}

    <div
      className={cn(
        "flex items-center gap-2",
        isReply &&
          "-mx-1 rounded-md px-1 py-1 transition-colors hover:bg-muted/30"
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      </div>
      <div className="flex flex-1 flex-wrap items-baseline gap-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-16" />
        {showReplyBadge && (
          <Badge className="text-xs" variant="secondary">
            <CornerUpLeft className="mr-1 h-3 w-3" />
            Reply
          </Badge>
        )}
        {showEditedBadge && (
          <Badge className="text-xs" variant="secondary">
            Edited
          </Badge>
        )}
        {showPinnedBadge && (
          <Badge className="text-xs" variant="outline">
            Pinned
          </Badge>
        )}
        {showThreadBadge && (
          <Badge className="text-xs" variant="secondary">
            <Skeleton className="h-3 w-12" />
          </Badge>
        )}
      </div>
    </div>

    <div
      className={cn(
        "mt-2 rounded-xl bg-background/80 p-3 shadow-sm ring-1 ring-border/50 backdrop-blur-sm transition-colors",
        isReply && "cursor-pointer hover:bg-background hover:shadow-md"
      )}
    >
      <div className="flex flex-col gap-3">
        {contentLines > 0 && (
          <div className="space-y-2">
            {Array.from({ length: contentLines }).map((_, index) => (
              <Skeleton
                className={cn(
                  "h-4",
                  index === contentLines - 1 ? "w-4/5" : "w-full"
                )}
                key={index.toString()}
              />
            ))}
          </div>
        )}

        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((type, index) =>
              renderAttachmentSkeleton(type, index)
            )}
          </div>
        )}
      </div>
    </div>

    {showActions && <MessageActionSkeleton />}
  </div>
);

const messageSkeletonBlueprints: Array<MessageSkeletonProps & { id: string }> =
  [
    {
      id: "reply-with-parent",
      showParentPreview: true,
      isReply: true,
      showReplyBadge: true,
      contentLines: 2,
      attachments: [],
    },
    {
      id: "threaded-media",
      showThreadBadge: true,
      showThreadSummary: true,
      attachments: ["media"],
      contentLines: 1,
    },
    {
      id: "pinned-file",
      showPinnedBadge: true,
      showEditedBadge: true,
      attachments: ["file"],
      contentLines: 0,
    },
    {
      id: "audio-note",
      attachments: ["audio"],
      contentLines: 0,
    },
    {
      id: "rich-text",
      contentLines: 4,
    },
  ];

export const MessageListSkeleton = () => (
  <div className="flex-1 overflow-hidden bg-background p-9">
    <div className="space-y-3 py-4">
      {messageSkeletonBlueprints.map(({ id, ...config }) => (
        <MessageSkeleton key={id} {...config} />
      ))}
    </div>
  </div>
);
