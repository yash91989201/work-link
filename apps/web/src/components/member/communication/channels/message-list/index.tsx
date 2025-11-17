import { useVirtualMessages } from "@/hooks/communications/use-virtual-messages";
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
            <div className="absolute inset-x-0 top-0 z-10 flex justify-center py-1 text-muted-foreground text-xs">
              Loading older messages…
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
            {virtualItems.map((virtualRow) => {
              const message = messages[virtualRow.index];
              if (!message) return null;

              return (
                <div
                  className="p-3"
                  data-index={virtualRow.index}
                  key={message.id}
                  ref={virtualizer.measureElement}
                  style={{
                    minHeight: virtualRow.size,
                  }}
                >
                  <MessageItem message={message} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
