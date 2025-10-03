import { MessageCircle } from "lucide-react";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useMessages } from "@/hooks/communications/use-messages-refactored";
import { cn } from "@/lib/utils";
import { MessageItem } from "./message-item";

interface MessageListProps {
  channelId: string;
  className?: string;
}

const EmptyState = () => (
  <div className="flex h-full items-center justify-center p-8">
    <div className="max-w-sm space-y-6 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
        <MessageCircle className="h-10 w-10 text-primary/60" />
      </div>
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground text-lg">
          Welcome to the channel!
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          This is the beginning of your conversation. Start by sending a message
          to break the ice. 🎉
        </p>
      </div>
      <div className="space-y-2">
        <p className="font-medium text-muted-foreground text-xs">Tips:</p>
        <ul className="space-y-1 text-muted-foreground text-xs">
          <li>• Be respectful and professional</li>
          <li>• Use @ to mention team members</li>
          <li>• Share files with the attachment button</li>
        </ul>
      </div>
    </div>
  </div>
);

const MessageSkeleton = () => (
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

const LoadingSkeleton = () => (
  <div className="space-y-1 py-4">
    {Array.from({ length: 8 }).map((_, index) => (
      <MessageSkeleton key={index.toString()} />
    ))}
  </div>
);

export function MessageList({ channelId, className }: MessageListProps) {
  const {
    messages,
    isFetchingChannelMessage,
    deletingMessageId,
    updatingMessageId,
    pinningMessageId,
    createMessage,
    deleteMessage,
    updateMessage,
    messagesEndRef,
    pinMessage,
  } = useMessages(channelId);

  const handleDelete = useCallback(
    async (messageId: string) => {
      try {
        await deleteMessage({ messageId });
        toast("Message deleted successfully");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete message";
        toast(message);
      }
    },
    [deleteMessage]
  );

  const handleReply = useCallback(
    async (content: string, parentMessageId: string, mentions?: string[]) => {
      try {
        await createMessage({
          channelId,
          content,
          parentMessageId,
          mentions,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to send reply";
        toast(message);
        throw error;
      }
    },
    [channelId, createMessage]
  );

  const handleEdit = useCallback(
    async (messageId: string, content: string, mentions?: string[]) => {
      try {
        await updateMessage({ messageId, content, mentions });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to update message";
        toast(message);
        throw error;
      }
    },
    [updateMessage]
  );

  const handlePin = useCallback(
    async (messageId: string) => {
      try {
        await pinMessage({ messageId });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to pin message";
        toast(message);
        throw error;
      }
    },
    [pinMessage]
  );

  // Memoize sorted messages
  const orderedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      ),
    [messages]
  );

  const hasMessages = orderedMessages.length > 0;

  if (isFetchingChannelMessage) {
    return (
      <div className={cn("flex-1 overflow-hidden bg-background", className)}>
        <ScrollArea className="h-full">
          <LoadingSkeleton />
        </ScrollArea>
      </div>
    );
  }

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
        <div className="flex flex-col pt-3 sm:px-4">
          {orderedMessages.map((message) => (
            <MessageItem
              channelId={channelId}
              isDeleting={deletingMessageId === message.id}
              isUpdating={updatingMessageId === message.id}
              isPinning={pinningMessageId === message.id}
              key={message.id}
              message={message}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onPin={handlePin}
              onReply={handleReply}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
