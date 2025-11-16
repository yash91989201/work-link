import { useParams } from "@tanstack/react-router";
import type { MessageWithSenderType } from "@work-link/api/lib/types";
import { useMemo, useState } from "react";
import { MaximizedMessageComposer } from "@/components/member/communication/channels/message-composer/maximized-message-composer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMessageMutations } from "@/hooks/communications/use-message-mutations";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { cn } from "@/lib/utils";
import { useMessageThreadSidebar } from "@/stores/channel-store";
import { MessageActions } from "./message-actions";
import { MessageContent } from "./message-content";
import { MessageReactions } from "./message-reactions";

interface MessageItemProps {
  message: MessageWithSenderType;
  canReply?: boolean;
}

export function MessageItem({ message, canReply = true }: MessageItemProps) {
  const { id: channelId } = useParams({
    from: "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id",
  });

  const [showEditDialog, setShowEditDialog] = useState(false);

  const {
    deleteMessage,
    pinMessage,
    unPinMessage,
    addReaction,
    removeReaction,
  } = useMessageMutations();

  const { user } = useAuthedSession();

  const { messageId, openMessageThread, closeMessageThread } =
    useMessageThreadSidebar();

  const handleDelete = () => {
    deleteMessage({ messageId: message.id });
  };

  const handlePin = () => {
    if (message.isPinned) {
      unPinMessage({ messageId: message.id });
    } else {
      pinMessage({ messageId: message.id });
    }
  };

  const handleReact = (emoji: string) => {
    addReaction({ messageId: message.id, emoji });
  };

  const handleReactionClick = (emoji: string) => {
    removeReaction({ messageId: message.id, emoji });
  };

  const handleEditDialog = () => {
    setShowEditDialog(true);
  };

  const handleEditSave = () => {
    setShowEditDialog(false);
  };

  const isThreadActive = useMemo(
    () => messageId === message.id,
    [messageId, message.id]
  );

  const handleReplyClick = () => {
    if (messageId === message.id) {
      closeMessageThread();
    } else {
      openMessageThread(message.id);
    }
  };

  const handleViewThread = () => {
    openMessageThread(message.id);
  };

  return (
    <div
      className={cn(
        "group relative space-y-6 rounded-xl p-3 transition-all hover:bg-muted/40",
        {
          "bg-primary/5 ring-2 ring-primary/20 hover:bg-primary/10":
            isThreadActive,
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

            {message.isEdited && <Badge variant="secondary">Edited</Badge>}

            {message.isPinned && <Badge variant="outline">📌</Badge>}

            {message.threadCount > 0 && (
              <Badge variant="secondary">{message.threadCount} 💬</Badge>
            )}
          </div>
        </div>
      </div>

      <MessageActions
        canEdit={user.id === message.senderId && message.type === "text"}
        canReply={canReply}
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

      {message.threadCount > 0 && (
        <Button
          className="rounded-full"
          onClick={handleViewThread}
          size="sm"
          variant="secondary"
        >
          View thread
        </Button>
      )}

      <MaximizedMessageComposer
        channelId={channelId}
        description="Make changes to your message. Click save when you're done."
        initialContent={message.content || ""}
        messageId={message.id}
        onOpenChange={setShowEditDialog}
        onSendSuccess={handleEditSave}
        open={showEditDialog}
        title="Edit Message"
      />
    </div>
  );
}
