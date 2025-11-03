import type { MessageWithSenderType } from "@work-link/api/lib/types";
import { useMessageItem } from "@/hooks/communications/use-message-item";
import { cn } from "@/lib/utils";
import { MessageActions } from "./message-actions";
import { MessageContent } from "./message-content";
import { MessageEditForm } from "./message-edit-form";
import { MessageHeader } from "./message-header";
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
      <MessageHeader
        createdAt={message.createdAt}
        isEdited={message.isEdited}
        isPinned={message.isPinned}
        sender={message.sender}
      />

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
