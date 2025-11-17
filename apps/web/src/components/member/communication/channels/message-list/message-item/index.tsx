import type { MessageWithSenderType } from "@work-link/api/lib/types";
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
import { formatMessageDate } from "@/utils/message-utils";
import { MessageActions } from "./message-actions";
import { MessageContent } from "./message-content";
import { MessageReactions } from "./message-reactions";

interface MessageItemProps {
  message: MessageWithSenderType;
  isThreadMessage?: boolean;
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
        "group relative flex gap-3 rounded-xl px-3 py-2 transition-all hover:bg-muted/40",
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

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {/* Header */}
        <div className="flex flex-wrap items-baseline gap-2 text-xs">
          <span className="font-semibold text-foreground text-sm">
            {message.sender.name}
          </span>

          <span className="text-muted-foreground text-xs">
            {formatMessageDate(message.createdAt)}
          </span>

          {message.isEdited && <Badge variant="secondary">Edited</Badge>}

          {message.isPinned && <Badge variant="outline">📌</Badge>}

          {message.threadCount > 0 && (
            <Badge variant="secondary">{message.threadCount} 💬</Badge>
          )}
        </div>

        {/* Message body */}
        <div className="mt-1">
          <MessageContent message={message} />
        </div>

        {/* Reactions */}
        <MessageReactions
          onAddReaction={handleReact}
          onRemoveReaction={handleReactionClick}
          reactions={message.reactions || []}
        />

        {/* Thread entry */}
        {message.threadCount > 0 && (
          <Button
            className={cn(
              "mt-1 inline-flex items-center gap-1.5 self-start rounded-full border border-border/70 border-dashed bg-muted/40 px-3 py-1 font-medium text-muted-foreground text-xs hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
              {
                "border-primary/60 bg-primary/5 text-primary":
                  isMessageThreadActive,
              }
            )}
            onClick={toggleMessageThread}
            size="sm"
            variant="ghost"
          >
            {isMessageThreadActive ? "Close thread" : "Open thread"}
          </Button>
        )}
      </div>

      <MessageActions
        canEdit={user.id === message.senderId && message.type === "text"}
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
