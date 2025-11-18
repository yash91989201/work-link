import type { MessageWithSenderType } from "@work-link/api/lib/types";
import { CornerDownRight, Pin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMessageMutations } from "@/hooks/communications/use-message-mutations";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { cn } from "@/lib/utils";
import {
  useMaximizedMessageComposerActions,
  useMessageThreadSidebar,
} from "@/stores/channel-store";
import { MessageActions } from "./message-actions";
import { MessageContent } from "./message-content";
import { MessageReactions } from "./message-reactions";

interface MessageItemProps {
  message: MessageWithSenderType;
  isThreadMessage?: boolean;
  isPinnedMessage?: boolean;
}

export function MessageItem({
  message,
  isThreadMessage = false,
}: MessageItemProps) {
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

  const isMessageThreadActive = messageId === message.id;

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

  const { openMaximizedMessageComposer } = useMaximizedMessageComposerActions();

  const handleEditDialog = () => {
    openMaximizedMessageComposer({
      messageId: message.id,
      content: message.content || "",
    });
  };

  const toggleMessageThread = () => {
    if (isMessageThreadActive) {
      closeMessageThread();
    } else {
      openMessageThread(message.id);
    }
  };

  return (
    <div
      className={cn(
        "group relative flex gap-3 rounded-xl p-3 transition-all hover:bg-muted/40",
        {
          "bg-primary/5 ring-2 ring-primary/20 hover:bg-primary/10":
            isMessageThreadActive,
        }
      )}
      data-message-id={message.id}
    >
      <div className="mt-1 shrink-0">
        <Avatar
          className={cn("h-10 w-10 ring-2 ring-border/40", {
            "h-8 w-8 ring-border/30": isThreadMessage,
          })}
        >
          <AvatarImage
            alt={message.sender.name}
            src={message.sender.image || undefined}
          />
          <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/10 font-semibold text-primary">
            {message.sender.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {/* Header */}
        <div className="flex flex-wrap items-stretch gap-3 text-xs">
          <span className="font-semibold text-foreground text-sm">
            {message.sender.name}
          </span>

          {message.isEdited && <Badge variant="secondary">Edited</Badge>}

          {message.isPinned && (
            <Badge variant="secondary">
              <Pin />
            </Badge>
          )}

          {message.threadCount > 0 && (
            <Badge className="gap-1.5" variant="secondary">
              <span>{message.threadCount}</span>
              <CornerDownRight />
            </Badge>
          )}
        </div>

        <MessageContent message={message} />

        <MessageReactions
          onAddReaction={handleReact}
          onRemoveReaction={handleReactionClick}
          reactions={message.reactions ?? []}
        />

        {message.threadCount > 0 && (
          <Button
            className="self-start rounded-full"
            onClick={toggleMessageThread}
            size="sm"
            variant="secondary"
          >
            {isMessageThreadActive ? "Close thread" : "Open thread"}
          </Button>
        )}
      </div>

      <MessageActions
        canEdit={user.id === message.senderId && message.type === "text"}
        canPin={!isThreadMessage}
        canReply={!isThreadMessage}
        isOwnMessage={user.id === message.senderId}
        isPinned={message.isPinned}
        onDelete={handleDelete}
        onEdit={handleEditDialog}
        onPin={handlePin}
        onReact={handleReact}
        onReply={toggleMessageThread}
      />
    </div>
  );
}
