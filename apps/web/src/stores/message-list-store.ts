import { create } from "zustand";

interface MessageThreadState {
  messageId: string | null;
  isOpen: boolean;
}

interface PinnedMessagesState {
  isOpen: boolean;
}

interface MessageListState {
  messageThread: MessageThreadState;
  pinnedMessages: PinnedMessagesState;
  openMessageThread: (messageId: string) => void;
  closeMessageThread: () => void;
  openPinnedMessages: () => void;
  closePinnedMessages: () => void;
}

export const useMessageListStore = create<MessageListState>((set) => ({
  pinnedMessages: {
    isOpen: false,
  },
  messageThread: {
    messageId: null,
    isOpen: false,
  },
  openMessageThread: (messageId) => {
    set({
      messageThread: {
        messageId,
        isOpen: true,
      },
    });
  },
  closeMessageThread: () => {
    set({
      messageThread: {
        messageId: null,
        isOpen: false,
      },
    });
  },
  openPinnedMessages: () => {
    set({
      pinnedMessages: {
        isOpen: true,
      },
    });
  },
  closePinnedMessages: () => {
    set({
      pinnedMessages: {
        isOpen: false,
      },
    });
  },
}));

export function useMessageList(channelId: string) {
  const { messageId, isOpen } = useMessageListStore(
    (state) => state.messageThread
  );

  return {
    channelId,
    threadMessageId: messageId,
    isMessageThreadOpen: isOpen,
  };
}

export function useMessageListActions() {
  const openMessageThread = useMessageListStore(
    (state) => state.openMessageThread
  );

  const closeMessageThread = useMessageListStore(
    (state) => state.closeMessageThread
  );

  const openPinnedMessages = useMessageListStore(
    (state) => state.openPinnedMessages
  );

  const closePinnedMessages = useMessageListStore(
    (state) => state.closePinnedMessages
  );

  return {
    openMessageThread,
    closeMessageThread,
    openPinnedMessages,
    closePinnedMessages,
  };
}

export function usePinnedMessagesSidebar() {
  const isOpen = useMessageListStore((state) => state.pinnedMessages.isOpen);

  const openPinnedMessages = useMessageListStore(
    (state) => state.openPinnedMessages
  );

  const closePinnedMessages = useMessageListStore(
    (state) => state.closePinnedMessages
  );

  return {
    isOpen,
    openPinnedMessages,
    closePinnedMessages,
  };
}
