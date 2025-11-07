import { useParams } from "@tanstack/react-router";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useMessageList } from "@/stores/message-list-store";
import { cn } from "@/lib/utils";
import { EmptyState } from "./empty-state";
import { MessageItem } from "./message-item";

const MessageSkeleton = () => (
  <div className="flex gap-3 px-4 py-3">
    <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
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

export const MessageListSkeleton = () => (
  <div className="flex-1 overflow-hidden bg-background">
    <div className="space-y-1 py-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <MessageSkeleton key={index.toString()} />
      ))}
    </div>
  </div>
);

export function MessageList({ className }: { className?: string }) {
  const { id: channelId } = useParams({
    from: "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id",
  });
  const { orderedMessages, messagesEndRef } = useMessageList(channelId);

  const hasMessages = orderedMessages.length > 0;

  if (!hasMessages) {
    return (
      <div className={cn("flex-1 overflow-hidden bg-background", className)}>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={cn("flex-1 overflow-hidden bg-background", className)}>
      <ScrollArea className="h-full">
        <div className="flex flex-col gap-1.5 py-3 sm:px-4">
          {orderedMessages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
