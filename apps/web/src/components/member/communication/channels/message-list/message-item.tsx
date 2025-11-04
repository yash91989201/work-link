import type { MessageWithSenderType } from "@work-link/api/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useMessageItem } from "@/hooks/communications/use-message-item";
import { cn } from "@/lib/utils";
import { formatMessageDate } from "@/utils/message-utils";
import { MessageActions } from "./message-actions";
import { MessageContent } from "./message-content";
import { MessageEditForm } from "./message-edit-form";
import { MessageReplyForm } from "./message-reply-form";
import { MessageThreadPreview } from "./message-thread-preview";

type MessageWithParent = MessageWithSenderType & {
  parentMessage?: MessageWithSenderType | null;
};

interface MessageItemProps {
  message: MessageWithParent;
}

export function MessageItem({ message }: MessageItemProps) {
  const {
    channelId,
    state,
    isDeleting,
    isPinning,
    handleDelete,
    handleEdit,
    handleReply,
    handlePin,
    startEditing,
    startReplying,
    cancel,
  } = useMessageItem({
    messageId: message.id,
    isPinned: message.isPinned,
  });

  return (
    <div
      className={cn(
        "group relative px-4 transition-colors hover:bg-muted/30",
        message.parentMessage ? "py-3" : "py-2",
        isDeleting && "opacity-50"
      )}
    >
      {/* Thread preview if replying to another message */}
      {message.parentMessage && (
        <MessageThreadPreview parentMessage={message.parentMessage} />
      )}

      {/* Message header */}
      <div className="flex items-center gap-2">
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
      {state.mode === "editing" ? (
        <MessageEditForm
          channelId={channelId}
          initialContent={message.content || ""}
          messageId={message.id}
          onCancel={cancel}
          onSave={handleEdit}
        />
      ) : (
        <>
          <MessageContent message={message} />

          {/* Action buttons */}
          <MessageActions
            isDeleting={isDeleting}
            isPinned={message.isPinned}
            isPinning={isPinning}
            messageId={message.id}
            onDelete={handleDelete}
            onEdit={startEditing}
            onPin={handlePin}
            onReply={startReplying}
            senderId={message.senderId}
          />
        </>
      )}

      {/* Reply form */}
      {state.mode === "replying" && (
        <MessageReplyForm
          channelId={channelId}
          onCancel={cancel}
          onSubmit={handleReply}
          parentMessage={{
            id: message.id,
            content: message.content || "",
            sender: message.sender,
          }}
        />
      )}
    </div>
  );
}
