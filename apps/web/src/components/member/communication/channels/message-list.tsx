import type { MessageWithSenderOutput } from "@server/lib/schemas/message";
import { format } from "date-fns";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useMessages } from "@/hooks/communications";
import { cn } from "@/lib/utils";

interface MessageListProps {
  channelId: string;
  className?: string;
}

const EmptyState = () => (
  <div className="flex h-full items-center justify-center">
    <div className="text-center">
      <p className="text-muted-foreground">No messages yet</p>
      <p className="text-muted-foreground text-sm">Start the conversation!</p>
    </div>
  </div>
);

const MessageSkeleton = () => (
  <div className="flex gap-3 px-4 py-2">
    <Skeleton className="h-8 w-8 rounded-full" />
    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-4 w-full max-w-md" />
    </div>
  </div>
);

const MessageItem = ({
  message,
  onDelete,
}: {
  message: MessageWithSenderOutput;
  onDelete: (messageId: string) => Promise<void>;
}) => {
  const timestamp = format(message.createdAt, "MMM d, HH:mm");
  const initials = (message.senderName ?? "?").slice(0, 2).toUpperCase();

  return (
    <div className="flex gap-3 px-4 py-3 hover:bg-muted/40">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={message.senderImage ?? undefined} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-semibold text-sm">
            {message.senderName ?? "Unknown"}
          </span>
          <span className="text-muted-foreground text-xs">{timestamp}</span>
        </div>
        {message.content && (
          <p className="text-sm leading-relaxed">{message.content}</p>
        )}
      </div>
      <div className="flex items-start gap-1">
        <Button
          className="h-7 w-7"
          onClick={() => onDelete(message.id)}
          size="icon"
          variant="ghost"
        >
          ×
        </Button>
      </div>
    </div>
  );
};

export const MessageList = ({ channelId, className }: MessageListProps) => {
  const { messages, isLoading, deleteMessage } = useMessages(channelId);

  const handleDelete = async (messageId: string) => {
    try {
      await deleteMessage.mutateAsync({ messageId });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete message";
      toast.error(message);
    }
  };

  const orderedMessages = [...messages].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  return (
    <div className={cn("flex flex-1 flex-col", className)}>
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="space-y-4 p-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <MessageSkeleton key={index.toString()} />
            ))}
          </div>
        ) : orderedMessages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2 py-4">
            {orderedMessages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
