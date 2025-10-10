import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useMessages } from "@/hooks/communications/use-messages";
import { cn } from "@/lib/utils";
import { EmptyState } from "./empty-state";
import { MessageItem } from "./message-item";

interface MessageListProps {
  channelId: string;
  className?: string;
}

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
    isPinningMessage,
    isDeletingMessage,
    isUpdatingMessage,
    createMessage,
    deleteMessage,
    updateMessage,
    messagesEndRef,
    pinMessage,
    unpinMessage,
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
    async (messageId: string, isPinned: boolean) => {
      try {
        if (isPinned) {
          await unpinMessage({ messageId });
        } else {
          await pinMessage({ messageId });
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to pin message";
        toast(message);
        throw error;
      }
    },
    [pinMessage, unpinMessage]
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
              isDeleting={isDeletingMessage && deletingMessageId === message.id}
              isPinning={isPinningMessage && pinningMessageId === message.id}
              isUpdating={isUpdatingMessage && updatingMessageId === message.id}
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
