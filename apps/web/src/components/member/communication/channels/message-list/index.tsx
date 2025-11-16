import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/hooks/communications/use-messages";
import { EmptyState } from "./empty-state";
import { MessageItem } from "./message-item";

export function MessageList() {
  const {
    messages,
    messagesEndRef,
    hasMore,
    parentRef,
    virtualizer,
    virtualItems,
    showNewerButton,
    scrollToBottom,
  } = useMessages();

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-hidden bg-linear-to-b from-background via-background to-muted/10">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="relative flex-1 overflow-hidden bg-linear-to-b from-background via-background to-muted/10">
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
                  paddingBottom: "0.75rem",
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
