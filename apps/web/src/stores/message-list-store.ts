import type { MessageWithSenderType } from "@work-link/api/lib/types";
import { useMemo } from "react";
import { toast } from "sonner";
import { create } from "zustand";
import { useMessages } from "@/hooks/communications/use-messages";
import { useMessagesOld } from "@/hooks/communications/use-messages-old";

export type MessageWithParent = MessageWithSenderType & {
  parentMessage?: MessageWithSenderType | null;
};

interface ThreadState {
  parentMessageId: string | null;
  originMessageId: string | null;
  shouldFocusComposer: boolean;
  composerFocusKey: number;
}

interface MessageListState {
  threadState: ThreadState;
  isPinnedMessagesSidebarOpen: boolean;
  openThread: (
    message: MessageWithParent,
    options?: { focusComposer?: boolean }
  ) => void;
  closeThread: () => void;
  acknowledgeThreadComposerFocus: () => void;
  openPinnedMessagesSidebar: () => void;
  closePinnedMessagesSidebar: () => void;
}

const useMessageListStore = create<MessageListState>((set) => ({
  threadState: {
    parentMessageId: null,
    originMessageId: null,
    shouldFocusComposer: false,
    composerFocusKey: 0,
  },
  isPinnedMessagesSidebarOpen: false,

  openThread: (message, options) => {
    const parentMessageId = message.parentMessage?.id ?? message.id;
    const composerFocusKey = Date.now();
    set({
      threadState: {
        parentMessageId,
        originMessageId: message.id,
        shouldFocusComposer: Boolean(options?.focusComposer),
        composerFocusKey,
      },
    });
  },

  closeThread: () => {
    set({
      threadState: {
        parentMessageId: null,
        originMessageId: null,
        shouldFocusComposer: false,
        composerFocusKey: 0,
      },
    });
  },

  acknowledgeThreadComposerFocus: () => {
    set((state) => ({
      threadState: state.threadState.shouldFocusComposer
        ? { ...state.threadState, shouldFocusComposer: false }
        : state.threadState,
    }));
  },

  openPinnedMessagesSidebar: () => {
    set({ isPinnedMessagesSidebarOpen: true });
  },

  closePinnedMessagesSidebar: () => {
    set({ isPinnedMessagesSidebarOpen: false });
  },
}));

export function useMessageList(channelId: string) {
  const { messages } = useMessages({ channelId });
  const {
    deletingMessageId,
    updatingMessageId,
    pinningMessageId,
    isPinningMessage,
    isDeletingMessage,
    isUpdatingMessage,
    deleteMessage,
    updateMessage,
    messagesEndRef,
    pinMessage,
    unpinMessage,
  } = useMessagesOld(channelId);

  const threadState = useMessageListStore((state) => state.threadState);

  const orderedMessages = useMemo<MessageWithParent[]>(
    () =>
      [...messages].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      ),
    [messages]
  );

  const threadParentMessage = useMemo(() => {
    if (!threadState.parentMessageId) return null;

    return (
      messages.find((message) => message.id === threadState.parentMessageId) ??
      null
    );
  }, [messages, threadState.parentMessageId]);

  const threadMessages = useMemo(() => {
    if (!threadState.parentMessageId) return [];

    return orderedMessages.filter(
      (message) =>
        message.id === threadState.parentMessageId ||
        message.parentMessageId === threadState.parentMessageId
    );
  }, [orderedMessages, threadState.parentMessageId]);

  const handleDelete = async (messageId: string) => {
    try {
      await deleteMessage({ messageId });
      toast("Message deleted successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete message";
      toast(message);
    }
  };

  const handleEdit = async (
    messageId: string,
    content: string,
    mentions?: string[]
  ) => {
    try {
      await updateMessage({ messageId, content, mentions });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update message";
      toast(message);
      throw error;
    }
  };

  const handlePin = async (messageId: string, isPinned: boolean) => {
    try {
      if (isPinned) {
        await unpinMessage({ messageId });
      } else {
        await pinMessage({ messageId });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to pin message";
      toast(message);
      throw error;
    }
  };

  return {
    channelId,
    messages,
    orderedMessages,
    threadMessages,
    threadParentMessage,
    threadOriginMessageId: threadState.originMessageId,
    isThreadSidebarOpen: Boolean(threadState.parentMessageId),
    threadComposerFocusKey: threadState.composerFocusKey,
    shouldFocusThreadComposer: threadState.shouldFocusComposer,
    handleDelete,
    handleEdit,
    handlePin,
    isDeletingMessage,
    isUpdatingMessage,
    isPinningMessage,
    deletingMessageId,
    updatingMessageId,
    pinningMessageId,
    messagesEndRef,
  };
}

export function useMessageListActions() {
  const openThread = useMessageListStore((state) => state.openThread);
  const closeThread = useMessageListStore((state) => state.closeThread);
  const acknowledgeThreadComposerFocus = useMessageListStore(
    (state) => state.acknowledgeThreadComposerFocus
  );
  const openPinnedMessagesSidebar = useMessageListStore(
    (state) => state.openPinnedMessagesSidebar
  );
  const closePinnedMessagesSidebar = useMessageListStore(
    (state) => state.closePinnedMessagesSidebar
  );

  return {
    openThread,
    closeThread,
    acknowledgeThreadComposerFocus,
    openPinnedMessagesSidebar,
    closePinnedMessagesSidebar,
  };
}

export function usePinnedMessagesSidebar() {
  const isPinnedMessagesSidebarOpen = useMessageListStore(
    (state) => state.isPinnedMessagesSidebarOpen
  );
  const openPinnedMessagesSidebar = useMessageListStore(
    (state) => state.openPinnedMessagesSidebar
  );
  const closePinnedMessagesSidebar = useMessageListStore(
    (state) => state.closePinnedMessagesSidebar
  );

  return {
    isPinnedMessagesSidebarOpen,
    openPinnedMessagesSidebar,
    closePinnedMessagesSidebar,
  };
}

export type { ThreadState };
