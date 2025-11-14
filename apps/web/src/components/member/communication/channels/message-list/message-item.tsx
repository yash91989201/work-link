import { useParams } from "@tanstack/react-router";
import { CornerUpLeft } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useMessageItem } from "@/hooks/communications/use-message-item";
import { useReactionMutations } from "@/hooks/communications/use-reaction-mutations";
import { cn } from "@/lib/utils";
import type { MessageWithParent } from "@/stores/message-list-store";
import {
  useMessageList,
  useMessageListActions,
} from "@/stores/message-list-store";
import { formatMessageDate } from "@/utils/message-utils";
import { MaximizedMessageComposer } from "../message-composer/maximized-message-composer";
import { MessageActions } from "./message-actions";
import { MessageContent } from "./message-content";
import { MessageReactions } from "./message-reactions";
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

  const { handleDelete, handlePin } = useMessageItem({
    channelId,
    messageId: message.id,
    isPinned: message.isPinned,
  });

  const { addReaction, removeReaction } = useReactionMutations({ channelId });

  const handleReact = useCallback(
    (emoji: string) => {
      addReaction({ messageId: message.id, emoji });
    },
    [addReaction, message.id]
  );

  const handleReactionClick = useCallback(
    (emoji: string) => {
      removeReaction({ messageId: message.id, emoji });
    },
    [removeReaction, message.id]
  );

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
        "group relative rounded-xl px-4 py-3 transition-all hover:bg-muted/40",
        isThreadRoot &&
          "bg-primary/5 ring-2 ring-primary/20 hover:bg-primary/10",
        isThreadOrigin && "shadow-sm ring-2 ring-primary/30",
        message.parentMessageId &&
          "ml-3 border-primary/30 border-l-[3px] bg-linear-to-r from-muted/20 to-transparent pl-4"
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
          "flex items-start gap-3",
          isReply &&
            "-mx-1 cursor-pointer rounded-lg px-1 py-1.5 transition-all hover:bg-muted/40"
        )}
        onClick={isReply ? handleViewThread : undefined}
      >
        <Avatar className="h-10 w-10 ring-2 ring-border/50">
          <AvatarImage
            alt={message.sender.name}
            src={message.sender.image || undefined}
          />
          <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/10 font-semibold text-primary">
            {message.sender.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-foreground text-sm">
              {message.sender.name}
            </span>
            <span className="text-muted-foreground text-xs">
              {formatMessageDate(message.createdAt)}
            </span>
            {isReply && (
              <Badge className="h-5 gap-1 text-[11px]" variant="secondary">
                <CornerUpLeft className="h-3 w-3" />
                Reply
              </Badge>
            )}
            {message.isEdited && (
              <Badge className="h-5 text-[11px]" variant="secondary">
                Edited
              </Badge>
            )}
            {message.isPinned && (
              <Badge className="h-5 text-[11px]" variant="outline">
                📌 Pinned
              </Badge>
            )}
            {!message.parentMessageId && (message.threadCount ?? 0) > 0 && (
              <Badge className="h-5 gap-1 text-[11px]" variant="secondary">
                💬 {message.threadCount}{" "}
                {message.threadCount === 1 ? "reply" : "replies"}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/** biome-ignore lint/a11y/noStaticElementInteractions: <div elements are required to be interactive because we cannot use button here> */}
      {/** biome-ignore lint/a11y/useKeyWithClickEvents: <div elements are required to be interactive because we cannot use button here> */}
      {/** biome-ignore lint/a11y/noNoninteractiveElementInteractions: <div elements are required to be interactive because we cannot use button here> */}
      <div
        className={cn(
          "mt-2 rounded-2xl bg-linear-to-br from-background/95 to-background/80 p-4 shadow-sm ring-1 ring-border/40 backdrop-blur-sm transition-all",
          isReply &&
            "cursor-pointer hover:bg-background hover:shadow-md hover:ring-border/60"
        )}
        onClick={isReply ? handleViewThread : undefined}
      >
        <MessageContent message={message} />
      </div>

      {/* Reactions */}
      <MessageReactions
        onAddReaction={handleReact}
        onRemoveReaction={handleReactionClick}
        reactions={message.reactions || []}
      />

      {/* Action buttons */}
      <MessageActions
        isPinned={message.isPinned}
        messageId={message.id}
        messageType={message.type}
        onDelete={handleDelete}
        onEdit={handleEditDialog}
        onPin={handlePin}
        onReact={handleReact}
        onReply={handleReplyClick}
        senderId={message.senderId}
      />

      {canShowThreadSummary && (
        <button
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-primary/15 to-primary/10 px-5 py-2 font-medium text-primary text-xs shadow-sm ring-1 ring-primary/20 transition-all hover:from-primary/25 hover:to-primary/20 hover:shadow-md"
          onClick={handleViewThread}
          type="button"
        >
          <span className="font-semibold">View thread</span>
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-2 font-bold text-[10px] text-primary-foreground shadow-sm">
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
