import { Pin, X } from "lucide-react";
import { Activity, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePinnedMessagesSidebar } from "@/stores/message-list-store";
import { usePinnedMessages } from "@/hooks/communications/use-pinned-messages";
import { cn } from "@/lib/utils";
import { MessageItem } from "../message-list/message-item";

export function PinnedMessagesSidebar({ channelId }: { channelId: string }) {
  const { isPinnedMessagesSidebarOpen: isOpen, closePinnedMessagesSidebar: onClose } =
    usePinnedMessagesSidebar();
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
    <Activity mode={isOpen ? "visible" : "hidden"}>
      <div
        className={cn(
          "flex h-full w-96 transform flex-col overflow-hidden border-border border-l bg-background transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="shrink-0 border-border border-b p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Pin className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-foreground">
                  Pinned Messages
                </h3>
                <div className="flex flex-wrap items-center gap-1.5 text-muted-foreground text-xs">
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
              className="h-8 w-8"
              onClick={onClose}
              size="icon"
              variant="ghost"
            >
              <X />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-0 flex-1">
          <div
            className="flex-1 space-y-2 px-1.5 py-3"
            ref={scrollContainerRef}
          >
            {pinnedCount === 0 ? (
              <div className="mx-2 mt-2 rounded-lg border bg-muted/40 p-3 text-muted-foreground text-sm">
                No messages have been pinned yet. Pin important messages to keep
                them easily accessible.
              </div>
            ) : (
              orderedPinnedMessages.map((message) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  showParentPreview={false}
                  showThreadSummary={false}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </Activity>
  );
}
