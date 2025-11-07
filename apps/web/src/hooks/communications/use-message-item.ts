import { useCallback, useMemo, useReducer } from "react";
import { useMessageList } from "@/stores/message-list-store";

type MessageState = { mode: "view" } | { mode: "editing" };

type MessageAction = { type: "START_EDIT" } | { type: "CANCEL" };

function messageReducer(
  state: MessageState,
  action: MessageAction
): MessageState {
  switch (action.type) {
    case "START_EDIT":
      return { mode: "editing" };
    case "CANCEL":
      return { mode: "view" };
    default:
      return state;
  }
}

interface UseMessageItemOptions {
  channelId: string;
  messageId: string;
  isPinned: boolean;
}

export function useMessageItem({
  channelId,
  messageId,
  isPinned,
}: UseMessageItemOptions) {
  const {
    handleDelete: deleteMessage,
    handleEdit: editMessage,
    handlePin: pinMessage,
    isDeletingMessage,
    isPinningMessage,
    deletingMessageId,
    pinningMessageId,
  } = useMessageList(channelId);

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

  const handlePin = useCallback(async () => {
    await pinMessage(messageId, isPinned);
  }, [messageId, isPinned, pinMessage]);

  const startEditing = useCallback(() => {
    dispatch({ type: "START_EDIT" });
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
    handlePin,
    startEditing,
    cancel,
  };
}
