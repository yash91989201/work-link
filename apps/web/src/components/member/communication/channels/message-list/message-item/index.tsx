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
        "group relative flex flex-col gap-3 rounded-xl p-3 transition-all hover:bg-muted/40",
        {
          "bg-primary/5 ring-2 ring-primary/20 hover:bg-primary/10":
            isMessageThreadActive,
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
        canReply={!isThreadMessage}
        isOwnMessage={user.id === message.senderId}
        isPinned={message.isPinned}
        onDelete={handleDelete}
        onEdit={handleEditDialog}
        onPin={handlePin}
        onReact={handleReact}
        onReply={toggleMessageThread}
      />

      <MessageContent message={message} />

      <MessageReactions
        onAddReaction={handleReact}
        onRemoveReaction={handleReactionClick}
        reactions={message.reactions || []}
      />

      {message.threadCount > 0 && (
        <Button
          className="self-start rounded-full"
          onClick={toggleMessageThread}
          size="sm"
          variant="secondary"
        >
          {isMessageThreadActive ? "Close Thread" : "View Thread"}
        </Button>
      )}
    </div>
  );
}
