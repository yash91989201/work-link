import type { MessageType } from "@server/lib/types";
import { useCallback, useReducer } from "react";
import { cn } from "@/lib/utils";
import { MessageActions } from "./message-actions";
import { MessageContent } from "./message-content";
import { MessageEditForm } from "./message-edit-form";
import { MessageHeader } from "./message-header";
import { MessageReplyForm } from "./message-reply-form";
import { MessageThreadPreview } from "./message-thread-preview";

interface MessageItemProps {
  message: MessageType & {
    sender: { name: string; email: string; image?: string | null | undefined };
    parentMessage?: MessageType & {
      sender: { name: string; email: string; image: string | null };
    };
  };
  channelId: string;
  onDelete: (messageId: string) => Promise<void>;
  onEdit: (
    messageId: string,
    content: string,
    mentions?: string[]
  ) => Promise<void>;
  onReply: (
    content: string,
    parentMessageId: string,
    mentions?: string[]
  ) => Promise<void>;
  onPin: (messageId: string, isPinned: boolean) => Promise<void>;
  isDeleting?: boolean;
  isUpdating?: boolean;
  isPinning?: boolean;
}

type MessageState =
  | { mode: "view" }
  | { mode: "editing" }
  | { mode: "replying" };

type MessageAction =
  | { type: "START_EDIT" }
  | { type: "START_REPLY" }
  | { type: "CANCEL" };

function messageReducer(
  state: MessageState,
  action: MessageAction
): MessageState {
  switch (action.type) {
    case "START_EDIT":
      return { mode: "editing" };
    case "START_REPLY":
      return { mode: "replying" };
    case "CANCEL":
      return { mode: "view" };
    default:
      return state;
  }
}

export function MessageItem({
  message,
  channelId,
  onDelete,
  onEdit,
  onReply,
  onPin,
  isDeleting,
  isPinning,
}: MessageItemProps) {
  const [state, dispatch] = useReducer(messageReducer, { mode: "view" });

  const handleDelete = useCallback(async () => {
    await onDelete(message.id);
  }, [message.id, onDelete]);

  const handleEdit = useCallback(
    async (messageId: string, content: string, mentions?: string[]) => {
      await onEdit(messageId, content, mentions);
      dispatch({ type: "CANCEL" });
    },
    [onEdit]
  );

  const handleReply = useCallback(
    async (content: string, parentMessageId: string, mentions?: string[]) => {
      await onReply(content, parentMessageId, mentions);
      dispatch({ type: "CANCEL" });
    },
    [onReply]
  );

  const handlePin = useCallback(async () => {
    await onPin(message.id, message.isPinned);
  }, [message.id, message.isPinned, onPin]);

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
          onCancel={() => dispatch({ type: "CANCEL" })}
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
            onEdit={() => dispatch({ type: "START_EDIT" })}
            onPin={handlePin}
            onReply={() => dispatch({ type: "START_REPLY" })}
            senderId={message.senderId}
          />
        </>
      )}

      {/* Reply form */}
      {state.mode === "replying" && (
        <MessageReplyForm
          channelId={channelId}
          onCancel={() => dispatch({ type: "CANCEL" })}
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
