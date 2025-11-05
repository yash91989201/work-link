import type { MessageWithSenderType } from "@work-link/api/lib/types";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { useMessages } from "@/hooks/communications/use-messages";

export type MessageWithParent = MessageWithSenderType & {
  parentMessage?: MessageWithSenderType | null;
};

interface MessageListContextValue {
  channelId: string;
  messages: MessageWithParent[];
  orderedMessages: MessageWithParent[];
  threadMessages: MessageWithParent[];
  threadParentMessage: MessageWithParent | null;
  threadOriginMessageId: string | null;
  isThreadSidebarOpen: boolean;
  threadComposerFocusKey: number;

  // Mutation functions
  handleDelete: (messageId: string) => Promise<void>;
  handleEdit: (
    messageId: string,
    content: string,
    mentions?: string[]
  ) => Promise<void>;
  handlePin: (messageId: string, isPinned: boolean) => Promise<void>;
  openThread: (
    message: MessageWithParent,
    options?: { focusComposer?: boolean }
  ) => void;
  closeThread: () => void;
  shouldFocusThreadComposer: boolean;
  acknowledgeThreadComposerFocus: () => void;

  // Loading states
  isDeletingMessage: boolean;
  isUpdatingMessage: boolean;
  isPinningMessage: boolean;
  deletingMessageId?: string;
  updatingMessageId?: string;
  pinningMessageId?: string;

  // Scroll ref
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const MessageListContext = createContext<MessageListContextValue | null>(null);

interface MessageListProviderProps {
  channelId: string;
  children: ReactNode;
}

export function MessageListProvider({
  channelId,
  children,
}: MessageListProviderProps) {
  const {
    messages,
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
  } = useMessages(channelId);

  const [threadState, setThreadState] = useState<{
    parentMessageId: string | null;
    originMessageId: string | null;
    shouldFocusComposer: boolean;
    composerFocusKey: number;
  }>({
    parentMessageId: null,
    originMessageId: null,
    shouldFocusComposer: false,
    composerFocusKey: 0,
  });

  const handleDelete = useCallback(
    async (messageId: string) => {
      try {
        await deleteMessage({ messageId });
        toast("Message deleted successfully");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete message";
        toast(message);
      }
    },
    [deleteMessage]
  );

  const handleEdit = useCallback(
    async (messageId: string, content: string, mentions?: string[]) => {
      try {
        await updateMessage({ messageId, content, mentions });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to update message";
        toast(message);
        throw error;
      }
    },
    [updateMessage]
  );

  const handlePin = useCallback(
    async (messageId: string, isPinned: boolean) => {
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
    },
    [pinMessage, unpinMessage]
  );

  const openThread = useCallback(
    (message: MessageWithParent, options?: { focusComposer?: boolean }) => {
      const parentMessageId = message.parentMessage?.id ?? message.id;
      const composerFocusKey = Date.now();
      setThreadState({
        parentMessageId,
        originMessageId: message.id,
        shouldFocusComposer: Boolean(options?.focusComposer),
        composerFocusKey,
      });
    },
    []
  );

  const closeThread = useCallback(() => {
    setThreadState({
      parentMessageId: null,
      originMessageId: null,
      shouldFocusComposer: false,
      composerFocusKey: 0,
    });
  }, []);

  const acknowledgeThreadComposerFocus = useCallback(() => {
    setThreadState((prev) =>
      prev.shouldFocusComposer
        ? { ...prev, shouldFocusComposer: false }
        : prev
    );
  }, []);

  const orderedMessages = useMemo(
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

  const value = useMemo(
    () => ({
      channelId,
      messages,
      orderedMessages,
      threadMessages,
      threadParentMessage,
      threadOriginMessageId: threadState.originMessageId,
      isThreadSidebarOpen: Boolean(threadState.parentMessageId),
      threadComposerFocusKey: threadState.composerFocusKey,
      handleDelete,
      handleEdit,
      handlePin,
      openThread,
      closeThread,
      shouldFocusThreadComposer: threadState.shouldFocusComposer,
      acknowledgeThreadComposerFocus,
      isDeletingMessage,
      isUpdatingMessage,
      isPinningMessage,
      deletingMessageId,
      updatingMessageId,
      pinningMessageId,
      messagesEndRef,
    }),
    [
      channelId,
      messages,
      orderedMessages,
      threadMessages,
      threadParentMessage,
      threadState.originMessageId,
      threadState.parentMessageId,
      threadState.composerFocusKey,
      handleDelete,
      handleEdit,
      handlePin,
      openThread,
      closeThread,
      threadState.shouldFocusComposer,
      acknowledgeThreadComposerFocus,
      isDeletingMessage,
      isUpdatingMessage,
      isPinningMessage,
      deletingMessageId,
      updatingMessageId,
      pinningMessageId,
      messagesEndRef,
    ]
  );

  return (
    <MessageListContext.Provider value={value}>
      {children}
    </MessageListContext.Provider>
  );
}

export function useMessageListContext() {
  const context = useContext(MessageListContext);

  if (!context) {
    throw new Error(
      "useMessageListContext must be used within MessageListProvider"
    );
  }

  return context;
}
