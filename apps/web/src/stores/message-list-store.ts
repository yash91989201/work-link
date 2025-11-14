import type { MessageWithSenderType } from "@work-link/api/lib/types";
import { useMemo } from "react";
import { create } from "zustand";
import { useMessageMutations } from "@/hooks/communications/use-message-mutations";
import { useMessages } from "@/hooks/communications/use-messages";

interface ThreadState {
  parentMessageId: string | null;
  originMessageId: string | null;
  shouldFocusComposer: boolean;
  composerFocusKey: number;
}

interface MentionState {
  messageId: string | null;
  shouldPlaySound: boolean;
}

interface MessageListState {
  threadState: ThreadState;
  mentionState: MentionState;
  isPinnedMessagesSidebarOpen: boolean;
  isMentionSidebarOpen: boolean;
  openThread: (
    message: MessageWithSenderType,
    options?: { focusComposer?: boolean }
  ) => void;
  closeThread: () => void;
  acknowledgeThreadComposerFocus: () => void;
  openPinnedMessagesSidebar: () => void;
  closePinnedMessagesSidebar: () => void;
  openMentionSidebar: (messageId: string) => void;
  closeMentionSidebar: () => void;
  acknowledgeMentionSound: () => void;
  setMentionMessage: (messageId: string) => void;
}

const useMessageListStore = create<MessageListState>((set) => ({
  threadState: {
    parentMessageId: null,
    originMessageId: null,
    shouldFocusComposer: false,
    composerFocusKey: 0,
  },
  mentionState: {
    messageId: null,
    shouldPlaySound: false,
  },
  isPinnedMessagesSidebarOpen: false,
  isMentionSidebarOpen: false,

  openThread: (message, options) => {
    const parentMessageId = message.parentMessageId ?? message.id;
    const composerFocusKey = Date.now();
    set({
      threadState: {
        parentMessageId,
        originMessageId: message.id,
        shouldFocusComposer: Boolean(options?.focusComposer),
        composerFocusKey,
      },
      // Close mention sidebar when opening thread
      isMentionSidebarOpen: false,
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

  openMentionSidebar: (messageId) => {
    set({
      isMentionSidebarOpen: true,
      mentionState: {
        messageId,
        shouldPlaySound: true,
      },
    });
  },

  closeMentionSidebar: () => {
    set({
      isMentionSidebarOpen: false,
      mentionState: {
        messageId: null,
        shouldPlaySound: false,
      },
    });
  },

  acknowledgeMentionSound: () => {
    set((state) => ({
      mentionState: {
        ...state.mentionState,
        shouldPlaySound: false,
      },
    }));
  },

  setMentionMessage: (messageId) => {
    set(() => ({
      mentionState: {
        messageId,
        shouldPlaySound: false,
      },
    }));
  },
}));

export function useMessageList(channelId: string) {
  const { messages, messagesEndRef, hasMore, loadMore } = useMessages({
    channelId,
  });

  const {
    deleteMessage,
    updateMessage,
    pinMessage,
    unPinMessage,
    addReaction,
    removeReaction,
    createMessage,
  } = useMessageMutations();

  const threadState = useMessageListStore((state) => state.threadState);
  const mentionState = useMessageListStore((state) => state.mentionState);
  const isMentionSidebarOpen = useMessageListStore(
    (state) => state.isMentionSidebarOpen
  );

  const threadParentMessage = useMemo(() => {
    if (!threadState.parentMessageId) return null;

    const found =
      messages.find((message) => message.id === threadState.parentMessageId) ??
      null;

    return found;
  }, [messages, threadState.parentMessageId]);

  const threadMessages = useMemo(() => {
    if (!threadState.parentMessageId) return [];

    const filtered = messages.filter(
      (message) =>
        message.id === threadState.parentMessageId ||
        message.parentMessageId === threadState.parentMessageId
    );

    return filtered;
  }, [messages, threadState.parentMessageId]);

  const mentionMessage = useMemo(() => {
    if (!mentionState.messageId) return null;

    return (
      messages.find((message) => message.id === mentionState.messageId) ?? null
    );
  }, [messages, mentionState.messageId]);

  const handleDelete = (messageId: string) => {
    deleteMessage({ messageId });
  };

  const handleEdit = (
    messageId: string,
    content: string,
    mentions?: string[]
  ) => {
    updateMessage({
      message: {
        messageId,
        content,
        mentions,
      },
    });
  };

  const handlePin = (messageId: string, isPinned: boolean) => {
    if (isPinned) {
      unPinMessage({ messageId });
    } else {
      pinMessage({ messageId });
    }
  };

  return {
    channelId,
    messages,
    threadMessages,
    threadParentMessage,
    threadOriginMessageId: threadState.originMessageId,
    isThreadSidebarOpen: Boolean(threadState.parentMessageId),
    threadComposerFocusKey: threadState.composerFocusKey,
    shouldFocusThreadComposer: threadState.shouldFocusComposer,
    isMentionSidebarOpen,
    mentionMessage,
    shouldPlayMentionSound: mentionState.shouldPlaySound,
    handleDelete,
    handleEdit,
    handlePin,
    addReaction,
    removeReaction,
    createMessage,
    messagesEndRef,
    hasMore,
    loadMore,
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
  const openMentionSidebar = useMessageListStore(
    (state) => state.openMentionSidebar
  );
  const closeMentionSidebar = useMessageListStore(
    (state) => state.closeMentionSidebar
  );
  const acknowledgeMentionSound = useMessageListStore(
    (state) => state.acknowledgeMentionSound
  );
  const setMentionMessage = useMessageListStore(
    (state) => state.setMentionMessage
  );

  return {
    openThread,
    closeThread,
    acknowledgeThreadComposerFocus,
    openPinnedMessagesSidebar,
    closePinnedMessagesSidebar,
    openMentionSidebar,
    closeMentionSidebar,
    acknowledgeMentionSound,
    setMentionMessage,
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

export type { ThreadState, MentionState };
