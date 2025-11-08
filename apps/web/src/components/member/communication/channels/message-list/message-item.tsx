import { CornerUpLeft } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { MessageWithParent } from "@/stores/message-list-store";
import {
  useMessageList,
  useMessageListActions,
} from "@/stores/message-list-store";
import { useMessageItem } from "@/hooks/communications/use-message-item";
import { cn } from "@/lib/utils";
import { formatMessageDate } from "@/utils/message-utils";
import { MaximizedMessageComposer } from "../message-composer/maximized-message-composer";
import { MessageActions } from "./message-actions";
import { MessageContent } from "./message-content";
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
  const { id: channelId } = useParams({
    from: "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id",
  });

  const [showEditDialog, setShowEditDialog] = useState(false);

  const { threadOriginMessageId, threadParentMessage, isThreadSidebarOpen } =
    useMessageList(channelId);

  const { openThread, closeThread } = useMessageListActions();

  const { isDeleting, isPinning, handleDelete, handlePin } = useMessageItem({
    channelId,
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
    const parentId = message.parentMessage?.id ?? message.id;

    if (isThreadSidebarOpen && threadParentMessage?.id === parentId) {
      closeThread();
    } else {
      openThread(message, { focusComposer: true });
    }
  }, [
    message,
    openThread,
    closeThread,
    isThreadSidebarOpen,
    threadParentMessage,
  ]);

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
        "group relative rounded-lg px-4 transition-colors hover:bg-muted/30",
        message.parentMessageId ? "py-2.5" : "py-2",
        isDeleting && "opacity-50",
        isThreadRoot && "bg-primary/5 hover:bg-primary/10",
        isThreadOrigin && "ring-1 ring-primary/40",
        message.parentMessageId &&
          "ml-2 border-primary/20 border-l-2 bg-muted/10 pl-4"
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
      {/** biome-ignore lint/a11y/noStaticElementInteractions: <div elements are required to be interactive because we cannot use button here> */}
      {/** biome-ignore lint/a11y/useKeyWithClickEvents: <div elements are required to be interactive because we cannot use button here> */}
      {/** biome-ignore lint/a11y/noNoninteractiveElementInteractions: <div elements are required to be interactive because we cannot use button here> */}
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
          {!message.parentMessageId && (message.threadCount ?? 0) > 0 && (
            <Badge className="text-xs" variant="secondary">
              {message.threadCount}{" "}
              {message.threadCount === 1 ? "reply" : "replies"}
            </Badge>
          )}
        </div>
      </div>

      {/** biome-ignore lint/a11y/noStaticElementInteractions: <div elements are required to be interactive because we cannot use button here> */}
      {/** biome-ignore lint/a11y/useKeyWithClickEvents: <div elements are required to be interactive because we cannot use button here> */}
      {/** biome-ignore lint/a11y/noNoninteractiveElementInteractions: <div elements are required to be interactive because we cannot use button here> */}
      <div
        className={cn(
          "mt-2 rounded-xl bg-background/80 p-3 shadow-sm ring-1 ring-border/50 backdrop-blur-sm transition-colors",
          isReply && "cursor-pointer hover:bg-background hover:shadow-md"
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
        messageType={message.type}
        onDelete={handleDelete}
        onEdit={handleEditDialog}
        onPin={handlePin}
        onReply={handleReplyClick}
        senderId={message.senderId}
      />

      {canShowThreadSummary && (
        <button
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 font-medium text-primary text-xs transition-all hover:bg-primary/20 hover:shadow-sm"
          onClick={handleViewThread}
          type="button"
        >
          View thread
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-2 font-semibold text-[11px] text-primary-foreground">
            {message.threadCount}
          </span>
        </button>
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
