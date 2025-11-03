import { useCallback, useMemo, useReducer } from "react";
import { useMessageListContext } from "@/contexts/message-list-context";

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

interface UseMessageItemOptions {
  messageId: string;
  isPinned: boolean;
}

export function useMessageItem({ messageId, isPinned }: UseMessageItemOptions) {
  const {
    channelId,
    handleDelete: deleteMessage,
    handleEdit: editMessage,
    handleReply: replyMessage,
    handlePin: pinMessage,
    isDeletingMessage,
    isPinningMessage,
    deletingMessageId,
    pinningMessageId,
  } = useMessageListContext();

  const [state, dispatch] = useReducer(messageReducer, { mode: "view" });

  const isDeleting = useMemo(
    () => isDeletingMessage && deletingMessageId === messageId,
    [isDeletingMessage, deletingMessageId, messageId]
  );

  const isPinning = useMemo(
    () => isPinningMessage && pinningMessageId === messageId,
    [isPinningMessage, pinningMessageId, messageId]
  );

  const handleDelete = useCallback(async () => {
    await deleteMessage(messageId);
  }, [messageId, deleteMessage]);

  const handleEdit = useCallback(
    async (id: string, content: string, mentions?: string[]) => {
      await editMessage(id, content, mentions);
      dispatch({ type: "CANCEL" });
    },
    [editMessage]
  );

  const handleReply = useCallback(
    async (content: string, parentMessageId: string, mentions?: string[]) => {
      await replyMessage(content, parentMessageId, mentions);
      dispatch({ type: "CANCEL" });
    },
    [replyMessage]
  );

  const handlePin = useCallback(async () => {
    await pinMessage(messageId, isPinned);
  }, [messageId, isPinned, pinMessage]);

  const startEditing = useCallback(() => {
    dispatch({ type: "START_EDIT" });
  }, []);

  const startReplying = useCallback(() => {
    dispatch({ type: "START_REPLY" });
  }, []);

  const cancel = useCallback(() => {
    dispatch({ type: "CANCEL" });
  }, []);

  return {
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
  };
}
