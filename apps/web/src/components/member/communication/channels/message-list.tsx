import type { MessageType } from "@server/lib/types";
import { format, formatDistanceToNow } from "date-fns";
import { Check, Edit3, MessageCircle, Reply, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EnhancedMessageContent } from "@/components/shared/message-content";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useMessages } from "@/hooks/communications";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { cn } from "@/lib/utils";

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

interface MessageItemProps {
  message: MessageType & {
    sender: { name: string; email: string; image: string | null };
  };
  onDelete: (messageId: string) => Promise<void>;
  onEdit: (messageId: string, content: string) => Promise<void>;
  isDeleting?: boolean;
  isUpdating?: boolean;
}

const MessageItem = ({
  message,
  onDelete,
  onEdit,
  isDeleting,
  isUpdating,
}: MessageItemProps) => {
  const { user } = useAuthedSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content || "");

  const timestamp = format(message.createdAt, "MMM d, HH:mm");
  const relativeTime = formatDistanceToNow(message.createdAt, {
    addSuffix: true,
  });
  const initials = (message.sender.name ?? "?").slice(0, 2).toUpperCase();
  const canEdit = user?.id === message.senderId;

  const handleSaveEdit = async () => {
    const trimmedContent = editContent.trim();
    if (!trimmedContent || trimmedContent === message.content) {
      setIsEditing(false);
      setEditContent(message.content || "");
      return;
    }

    try {
      await onEdit(message.id, trimmedContent);
      setIsEditing(false);
      toast("Message updated successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update message";
      toast(errorMessage);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content || "");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSaveEdit();
    } else if (event.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <div
      className={cn(
        "group flex gap-3 px-6 py-4 transition-colors hover:bg-muted/30",
        isDeleting && "pointer-events-none opacity-50"
      )}
    >
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage
          alt={message.sender.name ?? "User"}
          src={message.sender.image ?? undefined}
        />
        <AvatarFallback className="bg-primary/10 font-medium text-primary text-sm">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-baseline gap-3">
          <span className="font-semibold text-foreground text-sm">
            {message.sender.name ?? "Unknown User"}
          </span>
          <span className="text-muted-foreground text-xs" title={timestamp}>
            {relativeTime}
          </span>
          {message.createdAt > new Date(Date.now() - 1000 * 60 * 5) && (
            <Badge className="px-1 py-0 text-xs" variant="secondary">
              New
            </Badge>
          )}
          {message.isEdited && (
            <Badge className="px-1 py-0 text-xs" variant="outline">
              edited
            </Badge>
          )}
        </div>
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              autoFocus
              className="min-h-[80px] resize-none"
              disabled={isUpdating}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              value={editContent}
            />
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground text-xs">
                Press Enter to save, Escape to cancel, Shift+Enter for new line
              </div>
              <div className="flex items-center gap-2">
                <Button
                  className="h-7 px-2 text-xs"
                  disabled={isUpdating}
                  onClick={handleCancelEdit}
                  size="sm"
                  variant="ghost"
                >
                  <X className="mr-1 h-3 w-3" />
                  Cancel
                </Button>
                <Button
                  className="h-7 px-2 text-xs"
                  disabled={isUpdating || !editContent.trim()}
                  onClick={handleSaveEdit}
                  size="sm"
                >
                  {isUpdating ? (
                    <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                  ) : (
                    <Check className="mr-1 h-3 w-3" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          message.content && <EnhancedMessageContent message={message} />
        )}
        {!isEditing && (
          <div className="mt-2 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button className="h-7 px-2 text-xs" size="sm" variant="ghost">
              <Reply className="mr-1 h-3 w-3" />
              Reply
            </Button>
            {canEdit && (
              <Button
                className="h-7 px-2 text-xs"
                onClick={() => setIsEditing(true)}
                size="sm"
                variant="ghost"
              >
                <Edit3 className="mr-1 h-3 w-3" />
                Edit
              </Button>
            )}
          </div>
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
  onEdit,
  deletingMessageId,
  updatingMessageId,
}: {
  messages: (MessageType & {
    sender: { name: string; email: string; image: string | null };
  })[];
  onDelete: (messageId: string) => Promise<void>;
  onEdit: (messageId: string, content: string) => Promise<void>;
  deletingMessageId?: string;
  updatingMessageId?: string;
}) => {
  return (
    <div className="space-y-0">
      {messages.map((message, index) => (
        <div key={message.id}>
          <MessageItem
            isDeleting={deletingMessageId === message.id}
            isUpdating={updatingMessageId === message.id}
            message={message}
            onDelete={onDelete}
            onEdit={onEdit}
          />
          {index < messages.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );
};

const MessageListContent = ({
  isLoading,
  hasMessages,
  messages,
  onDelete,
  onEdit,
  deletingMessageId,
  updatingMessageId,
}: {
  isLoading: boolean;
  hasMessages: boolean;
  messages: (MessageType & {
    sender: { name: string; email: string; image: string | null };
  })[];
  onDelete: (messageId: string) => Promise<void>;
  onEdit: (messageId: string, content: string) => Promise<void>;
  deletingMessageId?: string;
  updatingMessageId?: string;
}) => {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!hasMessages) {
    return <EmptyState />;
  }

  return (
    <MessageContent
      deletingMessageId={deletingMessageId}
      messages={messages}
      onDelete={onDelete}
      onEdit={onEdit}
      updatingMessageId={updatingMessageId}
    />
  );
};

export const MessageList = ({ channelId, className }: MessageListProps) => {
  const {
    messages,
    isFetchingChannelMessage,
    deletingMessageId,
    updatingMessageId,
    deleteMessage,
    updateMessage,
    messagesEndRef,
  } = useMessages(channelId);

  const handleDelete = async (messageId: string) => {
    try {
      await deleteMessage({ messageId });
      toast("Message deleted successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete message";
      toast(message);
    }
  };

  const handleEdit = async (messageId: string, content: string) => {
    try {
      await updateMessage({ messageId, content });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update message";
      toast(message);
      throw error;
    }
  };

  const orderedMessages = [...messages].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  const hasMessages = orderedMessages.length > 0;

  return (
    <div className={cn("flex-1 overflow-hidden bg-background", className)}>
      <ScrollArea className="h-full">
        <div className="flex flex-col">
          <MessageListContent
            deletingMessageId={deletingMessageId}
            hasMessages={hasMessages}
            isLoading={isFetchingChannelMessage}
            messages={orderedMessages}
            onDelete={handleDelete}
            onEdit={handleEdit}
            updatingMessageId={updatingMessageId}
          />
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
};
