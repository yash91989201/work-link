import { ArrowDownIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVirtualMessages } from "@/hooks/communications/use-messages";
import { EmptyState } from "./empty-state";
import { MessageItem } from "./message-item";

export function MessageList() {
  const {
    scrollRef,
    virtualizer,
    virtualItems,
    totalSize,
    messages,
    isLoading,
    isFetchingNextPage,
    showScrollButton,
    scrollToBottom,
  } = useVirtualMessages();

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 overflow-hidden bg-linear-to-b from-background via-background to-muted/10">
        <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
          Loading messages...
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-hidden bg-linear-to-b from-background via-background to-muted/10">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="relative flex-1 overflow-hidden bg-linear-to-b from-background via-background to-muted/10">
      <div className="h-full overflow-auto" ref={scrollRef}>
        <div
          style={{
            height: totalSize,
            width: "100%",
            position: "relative",
          }}
        >
          {isFetchingNextPage && (
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-center gap-2 bg-background/80 py-2 shadow-sm backdrop-blur-sm">
              <Loader2Icon className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="font-medium text-muted-foreground text-sm">
                Loading older messages...
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
                <MessageItem message={messages[virtualRow.index]} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {showScrollButton && (
        <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center">
          <Button
            className="gap-2"
            onClick={scrollToBottom}
            variant="secondary"
          >
            <ArrowDownIcon className="h-4 w-4" />
            <span className="text-sm">Jump to latest messages</span>
          </Button>
        </div>
      )}
    </div>
  );
}
