import { useParams } from "@tanstack/react-router";
import type { MessageWithSenderType } from "@work-link/api/lib/types";
import { CornerUpLeft } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMessageItem } from "@/hooks/communications/use-message-item";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { cn } from "@/lib/utils";
import {
  useMessageList,
  useMessageListActions,
} from "@/stores/message-list-store";
import { formatMessageDate } from "@/utils/message-utils";
import { MaximizedMessageComposer } from "../message-composer/maximized-message-composer";
import { MessageActions } from "./message-actions";
import { MessageContent } from "./message-content";
import { MessageReactions } from "./message-reactions";

interface MessageItemProps {
  message: MessageWithSenderType;
  showParentPreview?: boolean;
  showThreadSummary?: boolean;
}

export function MessageItem({
  message,
  showThreadSummary = true,
}: MessageItemProps) {
  const { id: channelId } = useParams({
    from: "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id",
  });

  const { user } = useAuthedSession();
  const [showEditDialog, setShowEditDialog] = useState(false);

  const {
    threadOriginMessageId,
    threadParentMessage,
    isThreadSidebarOpen,
    addReaction,
    removeReaction,
  } = useMessageList(channelId);

  const { openThread, closeThread } = useMessageListActions();

  const { handleDelete, handlePin } = useMessageItem({
    channelId,
    messageId: message.id,
    isPinned: message.isPinned,
  });

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
    const parentId = message.parentMessageId ?? message.id;

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
    showThreadSummary && !message.parentMessageId && message.threadCount > 0;

  const isReply = Boolean(message.parentMessageId);

  return (
    <div
      className={cn(
        "group relative space-y-6 rounded-xl p-3 transition-all hover:bg-muted/40",
        {
          "bg-primary/5 ring-2 ring-primary/20 hover:bg-primary/10":
            isThreadRoot,
          "shadow-sm ring-2 ring-primary/30": isThreadOrigin,
        }
      )}
      data-message-id={message.id}
    >
      {/* Message header */}
      <div className="flex items-center gap-3">
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

      <MessageActions
        canEdit={user.id === message.senderId && message.type === "text"}
        isOwnMessage={user.id === message.senderId}
        isPinned={message.isPinned}
        onDelete={handleDelete}
        onEdit={handleEditDialog}
        onPin={handlePin}
        onReact={handleReact}
        onReply={handleReplyClick}
      />

      <div className="rounded-2xl bg-linear-to-br from-background/95 to-background/80 p-4 shadow-sm ring-1 ring-border/40 backdrop-blur-sm transition-all">
        <MessageContent message={message} />
      </div>

      {/* Reactions */}
      <MessageReactions
        onAddReaction={handleReact}
        onRemoveReaction={handleReactionClick}
        reactions={message.reactions || []}
      />

      {canShowThreadSummary && (
        <Button
          className="rounded-full"
          onClick={handleViewThread}
          size="sm"
          variant="outline"
        >
          <span className="font-semibold">View thread</span>
        </Button>
      )}

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
