import { CornerUpLeft } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  type MessageWithParent,
  useMessageListContext,
} from "@/contexts/message-list-context";
import { useMessageItem } from "@/hooks/communications/use-message-item";
import { cn } from "@/lib/utils";
import { formatMessageDate } from "@/utils/message-utils";
import { MaximizedMessageComposer } from "../message-composer/maximized-message-composer";
import { MessageActions } from "./message-actions";
import { MessageContent } from "./message-content";
import { MessageEditForm } from "./message-edit-form";
import { MessageThreadPreview } from "./message-thread-preview";

interface MessageItemProps {
  message: MessageWithParent;
  showParentPreview?: boolean;
  showThreadSummary?: boolean;
}

export function MessageItem({
  message,
  showParentPreview = true,
  showThreadSummary = true,
}: MessageItemProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);

  const {
    openThread,
    threadOriginMessageId,
    threadParentMessage,
    isThreadSidebarOpen,
  } = useMessageListContext();

  const {
    state,
    channelId,
    isDeleting,
    isPinning,
    handleDelete,
    handleEdit,
    handlePin,
    cancel,
  } = useMessageItem({
    messageId: message.id,
    isPinned: message.isPinned,
  });

  const handleEditDialog = useCallback(() => {
    setShowEditDialog(true);
  }, []);

  const handleEditSave = useCallback(() => {
    setShowEditDialog(false);
  }, []);

  const isThreadRoot = useMemo(
    () =>
      isThreadSidebarOpen && threadParentMessage
        ? threadParentMessage.id === message.id
        : false,
    [isThreadSidebarOpen, threadParentMessage, message.id]
  );

  const isThreadOrigin = useMemo(
    () =>
      isThreadSidebarOpen && threadOriginMessageId
        ? threadOriginMessageId === message.id
        : false,
    [isThreadSidebarOpen, threadOriginMessageId, message.id]
  );

  const handleReplyClick = useCallback(() => {
    openThread(message, { focusComposer: true });
  }, [message, openThread]);

  const handleViewThread = useCallback(() => {
    openThread(message);
  }, [message, openThread]);

  const canShowThreadSummary =
    showThreadSummary &&
    !message.parentMessageId &&
    (message.threadCount ?? 0) > 0;

  const isReply = Boolean(message.parentMessageId);

  return (
    <div
      className={cn(
        "group relative px-4",
        message.parentMessageId ? "py-3" : "py-2",
        isDeleting && "opacity-50",
        isThreadRoot && "bg-primary/5",
        isThreadOrigin && "ring-1 ring-primary/40",
        message.parentMessageId && "border-primary/20 border-l-2 bg-muted/10"
      )}
      data-message-id={message.id}
    >
      {/* Thread preview if replying to another message */}
      {showParentPreview && message.parentMessage && (
        <MessageThreadPreview
          onOpenThread={handleViewThread}
          parentMessage={message.parentMessage}
        />
      )}

      {/* Message header */}
      <div
        className={cn(
          "flex items-center gap-2",
          isReply &&
            "-mx-1 cursor-pointer rounded-md px-1 py-1 transition-colors hover:bg-muted/30"
        )}
        onClick={isReply ? handleViewThread : undefined}
      >
        <Avatar className="h-10 w-10">
          <AvatarImage
            alt={message.sender.name}
            src={message.sender.image || undefined}
          />
          <AvatarFallback className="bg-primary/10 font-semibold text-primary">
            {message.sender.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-1 items-baseline gap-2">
          <span className="font-semibold text-foreground">
            {message.sender.name}
          </span>
          <span className="text-muted-foreground text-xs">
            {formatMessageDate(message.createdAt)}
          </span>
          {isReply && (
            <Badge className="text-xs" variant="secondary">
              <CornerUpLeft className="mr-1 h-3 w-3" />
              Reply
            </Badge>
          )}
          {message.isEdited && (
            <Badge className="text-xs" variant="secondary">
              Edited
            </Badge>
          )}
          {message.isPinned && (
            <Badge className="text-xs" variant="outline">
              Pinned
            </Badge>
          )}
        </div>
      </div>

      {/* Message content or edit form */}
      {state.mode === "editing" && !showEditDialog ? (
        <MessageEditForm
          channelId={channelId}
          initialContent={message.content || ""}
          messageId={message.id}
          onCancel={cancel}
          onSave={handleEdit}
        />
      ) : (
        <>
          <div
            className={cn(
              "mt-1.5 rounded-xl bg-muted/30 p-3 ring-1 ring-border",
              isReply && "cursor-pointer transition-colors hover:bg-muted/50"
            )}
            onClick={isReply ? handleViewThread : undefined}
          >
            <MessageContent message={message} />
          </div>

          {/* Action buttons */}
          <MessageActions
            isDeleting={isDeleting}
            isPinned={message.isPinned}
            isPinning={isPinning}
            messageId={message.id}
            onDelete={handleDelete}
            onEdit={handleEditDialog}
            onPin={handlePin}
            onReply={handleReplyClick}
            senderId={message.senderId}
          />

          {canShowThreadSummary && (
            <button
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 font-medium text-muted-foreground text-xs transition hover:bg-muted/80"
              onClick={handleViewThread}
              type="button"
            >
              View thread
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-background px-2 font-semibold text-[11px] text-foreground">
                {message.threadCount}
              </span>
            </button>
          )}
        </>
      )}

      {/* Maximized Edit Dialog */}
      <MaximizedMessageComposer
        channelId={channelId}
        description="Make changes to your message. Click save when you're done."
        initialContent={message.content || ""}
        messageId={message.id}
        mode="edit"
        onOpenChange={setShowEditDialog}
        onSendSuccess={handleEditSave}
        open={showEditDialog}
        title="Edit Message"
      />
    </div>
  );
}
