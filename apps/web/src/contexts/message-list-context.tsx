import type { MessageWithSenderType } from "@work-link/api/lib/types";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo } from "react";
import { toast } from "sonner";
import { useMessages } from "@/hooks/communications/use-messages";

type MessageWithParent = MessageWithSenderType & {
  parentMessage?: MessageWithSenderType | null;
};

interface MessageListContextValue {
  channelId: string;
  messages: MessageWithParent[];
  orderedMessages: MessageWithParent[];

  // Mutation functions
  handleDelete: (messageId: string) => Promise<void>;
  handleReply: (
    content: string,
    parentMessageId: string,
    mentions?: string[]
  ) => Promise<void>;
  handleEdit: (
    messageId: string,
    content: string,
    mentions?: string[]
  ) => Promise<void>;
  handlePin: (messageId: string, isPinned: boolean) => Promise<void>;

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
    createMessage,
    deleteMessage,
    updateMessage,
    messagesEndRef,
    pinMessage,
    unpinMessage,
  } = useMessages(channelId);

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

  const handleReply = useCallback(
    async (content: string, parentMessageId: string, mentions?: string[]) => {
      try {
        await createMessage({
          channelId,
          content,
          parentMessageId,
          mentions,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to send reply";
        toast(message);
        throw error;
      }
    },
    [channelId, createMessage]
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

  const orderedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      ),
    [messages]
  );

  const value = useMemo(
    () => ({
      channelId,
      messages,
      orderedMessages,
      handleDelete,
      handleReply,
      handleEdit,
      handlePin,
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
      handleDelete,
      handleReply,
      handleEdit,
      handlePin,
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
