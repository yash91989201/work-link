import { Loader2Icon, Pin, X } from "lucide-react";
import { MessageItem } from "@/components/member/communication/channels/message-list/message-item";
import { Button } from "@/components/ui/button";
import { useVirtualPinnedMessages } from "@/hooks/communications/use-pinned-messages";
import { cn } from "@/lib/utils";
import { usePinnedMessagesSidebar } from "@/stores/channel-store";

export function PinnedMessagesSidebar() {
  const { isOpen, closePinnedMessages: onClose } = usePinnedMessagesSidebar();

  const {
    scrollRef,
    virtualizer,
    virtualItems,
    totalSize,
    pinnedMessages,
    isLoading,
    isFetchingNextPage,
  } = useVirtualPinnedMessages();

  const pinnedCount = pinnedMessages.length;

  return (
    <div
      className={cn(
        "flex h-full min-w-0 shrink-0 flex-col overflow-hidden bg-background/95 backdrop-blur-sm transition-[width,opacity] duration-300 ease-in-out supports-backdrop-filter:bg-background/60",
        isOpen
          ? "w-full max-w-full border-l opacity-100 shadow-lg sm:w-[560px]"
          : "w-0 max-w-0 opacity-0"
      )}
    >
      <div className="shrink-0 border-border border-b bg-muted/30 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <Pin className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-foreground text-lg">
                Pinned Messages
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-muted-foreground text-sm">
                {pinnedCount === 0 && <span>No pinned messages</span>}
                {pinnedCount > 0 && (
                  <span>
                    {pinnedCount} pinned message{pinnedCount === 1 ? "" : "s"}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button
            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
            onClick={onClose}
            size="icon"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading && pinnedMessages.length === 0 && (
        <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
          Loading pinned messages...
        </div>
      )}

      {!isLoading && pinnedCount === 0 && (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="rounded-lg border bg-muted/40 p-4 text-center text-muted-foreground text-sm">
            No messages have been pinned yet. Pin important messages to keep
            them easily accessible.
          </div>
        </div>
      )}

      {pinnedCount > 0 && (
        <div className="relative flex-1 overflow-hidden">
          <div className="h-full overflow-auto" ref={scrollRef}>
            <div
              style={{
                height: totalSize,
                width: "100%",
                position: "relative",
              }}
            >
              {isFetchingNextPage && (
                <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-2 bg-background/80 py-2 shadow-sm backdrop-blur-sm">
                  <Loader2Icon className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="font-medium text-muted-foreground text-sm">
                    Loading more pinned messages...
                  </span>
                </div>
              )}

              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualItems[0]?.start ?? 0}px)`,
                }}
              >
                {virtualItems.map((virtualRow) => (
                  <div
                    className="p-3"
                    data-index={virtualRow.index}
                    key={virtualRow.key}
                    ref={virtualizer.measureElement}
                  >
                    <MessageItem message={pinnedMessages[virtualRow.index]} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
