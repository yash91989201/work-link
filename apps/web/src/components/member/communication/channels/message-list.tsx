import { format } from "date-fns";
import { MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useMessages } from "@/hooks/communications";
import { cn } from "@/lib/utils";
import type { MessageType } from "@server/lib/types";

interface MessageListProps {
  channelId: string;
  className?: string;
}

const EmptyState = () => (
  <div className="flex h-full items-center justify-center p-8">
    <div className="space-y-3 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <MessageCircle className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-foreground text-sm">No messages yet</p>
        <p className="text-muted-foreground text-xs">
          Start the conversation by sending a message
        </p>
      </div>
    </div>
  </div>
);

const MessageSkeleton = () => (
  <div className="flex gap-3 px-4 py-3">
    <Skeleton className="h-8 w-8 flex-shrink-0 rounded-full" />
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

const LoadingSkeleton = () => (
  <div className="space-y-1 py-4">
    {Array.from({ length: 10 }).map((_, index) => (
      <MessageSkeleton key={index.toString()} />
    ))}
  </div>
);

interface MessageItemProps {
  message: MessageType & {
    sender: { name: string; email: string; image: string | null };
  };
  onDelete: (messageId: string) => Promise<void>;
  isDeleting?: boolean;
}

const MessageItem = ({ message, onDelete, isDeleting }: MessageItemProps) => {
  const timestamp = format(message.createdAt, "MMM d, HH:mm");
  const initials = (message.sender.name ?? "?").slice(0, 2).toUpperCase();

  return (
    <div
      className={cn(
        "group flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
        isDeleting && "pointer-events-none opacity-50"
      )}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage
          alt={message.sender.name ?? "User"}
          src={message.sender.image ?? undefined}
        />
        <AvatarFallback className="bg-primary/10 font-medium text-primary text-xs">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-baseline gap-2">
          <span className="font-semibold text-foreground text-sm">
            {message.sender.name ?? "Unknown User"}
          </span>
          <span className="text-muted-foreground text-xs">{timestamp}</span>
        </div>
        {message.content && (
          <p className="whitespace-pre-wrap break-words text-foreground text-sm leading-relaxed">
            {message.content}
          </p>
        )}
      </div>

      <div className="flex items-start opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          aria-label="Delete message"
          className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          disabled={isDeleting}
          onClick={() => onDelete(message.id)}
          size="icon"
          variant="ghost"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const MessageContent = ({
  messages,
  onDelete,
  isDeleting,
}: {
  messages: (MessageType & {
    sender: { name: string; email: string; image: string | null };
  })[];
  onDelete: (messageId: string) => Promise<void>;
  isDeleting: boolean;
}) => (
  <div className="space-y-0 py-2">
    {messages.map((message) => (
      <MessageItem
        isDeleting={isDeleting}
        key={message.id}
        message={message}
        onDelete={onDelete}
      />
    ))}
  </div>
);

const MessageListContent = ({
  isLoading,
  hasMessages,
  messages,
  onDelete,
  isDeleting,
}: {
  isLoading: boolean;
  hasMessages: boolean;
  messages: (MessageType & {
    sender: { name: string; email: string; image: string | null };
  })[];
  onDelete: (messageId: string) => Promise<void>;
  isDeleting: boolean;
}) => {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!hasMessages) {
    return <EmptyState />;
  }

  return (
    <MessageContent
      isDeleting={isDeleting}
      messages={messages}
      onDelete={onDelete}
    />
  );
};

export const MessageList = ({ channelId, className }: MessageListProps) => {
  const { messages, isLoading, deleteMessage } = useMessages(channelId);

  const handleDelete = async (messageId: string) => {
    try {
      await deleteMessage.mutateAsync({ messageId });
      toast.success("Message deleted successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete message";
      toast.error(message);
    }
  };

  const orderedMessages = [...messages].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  const hasMessages = orderedMessages.length > 0;

  return (
    <div className={cn("flex flex-1 flex-col overflow-hidden", className)}>
      <ScrollArea className="flex-1">
        <MessageListContent
          hasMessages={hasMessages}
          isDeleting={deleteMessage.isPending}
          isLoading={isLoading}
          messages={orderedMessages}
          onDelete={handleDelete}
        />
      </ScrollArea>
    </div>
  );
};
