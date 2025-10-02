import { Mic, Paperclip, Send, Smile } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

const MessageRowSkeleton = () => (
  <div className="flex gap-3 px-4 py-3">
    <Skeleton className="h-10 w-10 flex-shrink-0 rounded-full" />
    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-4 w-full max-w-md" />
      <Skeleton className="h-4 w-3/4 max-w-sm" />
    </div>
  </div>
);

export const PendingSkeleton = () => {
  return (
    <div className="flex min-h-0 flex-1 flex-col border-r">
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Message list skeleton */}
        <div className="flex-1 overflow-hidden bg-background">
          <ScrollArea className="h-full">
            <div className="flex flex-col pt-3 sm:px-4">
              <div className="space-y-1 py-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <MessageRowSkeleton key={i.toString()} />
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Message composer (exact layout, inputs disabled) */}
        <div className="flex-shrink-0 border-t bg-gradient-to-b from-background to-muted/20">
          <div className="relative p-4">
            <div className="relative flex items-end gap-3">
              <div className="flex items-center gap-1">
                <Button
                  className="h-10 w-10 text-muted-foreground"
                  disabled
                  size="icon"
                  variant="ghost"
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>

              {/* Message input */}
              <div className="group relative flex-1">
                <Textarea
                  className="max-h-40 min-h-[52px] resize-none rounded-lg border-muted bg-background/80 pr-12 shadow-sm backdrop-blur-sm placeholder:text-muted-foreground/60"
                  disabled
                  placeholder="Type a message... (@ to mention, / for commands)"
                  readOnly
                  value={""}
                />

                {/* Character count */}
                <Badge
                  className="absolute right-2 bottom-2"
                  variant="secondary"
                >
                  0/2000
                </Badge>
              </div>

              {/* Right actions */}
              <div className="flex items-center gap-1">
                <Button
                  className="text-muted-foreground"
                  disabled
                  size="icon"
                  variant="ghost"
                >
                  <Smile className="h-4 w-4" />
                </Button>
                <Button
                  className="h-10 w-10 text-muted-foreground"
                  disabled
                  size="icon"
                  variant="ghost"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  className="h-10 w-10"
                  disabled
                  size="icon"
                  title="Send message (Enter)"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Help text */}
            <div className="mt-3 flex items-center justify-between text-muted-foreground text-xs">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs">
                    Enter
                  </kbd>
                  to send
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs">
                    Shift+Enter
                  </kbd>
                  new line
                </span>
                <span>•</span>
                <span>@ to mention</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  className="h-auto p-0 text-xs"
                  disabled
                  size="sm"
                  variant="ghost"
                >
                  Markdown supported
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
