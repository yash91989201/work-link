import { useParams } from "@tanstack/react-router";
import { Pin, X } from "lucide-react";
import { useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePinnedMessages } from "@/hooks/communications/use-pinned-messages";
import { cn } from "@/lib/utils";
import { usePinnedMessagesSidebar } from "@/stores/message-list-store";
import { MessageItem } from "../message-list/message-item";

export function PinnedMessagesSidebar() {
  const { id: channelId } = useParams({
    from: "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id",
  });

  const {
    isOpen,
    closePinnedMessages: onClose,
  } = usePinnedMessagesSidebar();

  const { pinnedMessages } = usePinnedMessages({ channelId });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const orderedPinnedMessages = useMemo(
    () =>
      [...pinnedMessages].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      ),
    [pinnedMessages]
  );

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
                <span>
                  {pinnedCount === 0
                    ? "No pinned messages"
                    : `${pinnedCount} pinned message${
                        pinnedCount === 1 ? "" : "s"
                      }`}
                </span>
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

      <ScrollArea className="h-0 flex-1">
        <div className="flex-1 space-y-2 px-1.5 py-3" ref={scrollContainerRef}>
          {pinnedCount === 0 ? (
            <div className="mx-2 mt-2 rounded-lg border bg-muted/40 p-3 text-muted-foreground text-sm">
              No messages have been pinned yet. Pin important messages to keep
              them easily accessible.
            </div>
          ) : (
            orderedPinnedMessages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
