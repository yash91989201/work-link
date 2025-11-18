import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { create } from "zustand";
import { useChannelPresence } from "@/hooks/communications/use-channel-presence";
import { queryUtils } from "@/utils/orpc";

interface ChannelMember {
  id: string;
  name: string;
  email: string;
  image?: string | null | undefined;
  isOnline: boolean;
}

interface InfoSidebarState {
  isOpen: boolean;
}

type MaximizedMessageComposerResult =
  | { action: "submit" }
  | { action: "cancel"; content?: string | null };

type MaximizedComposerCompleteCallback = (
  result: MaximizedMessageComposerResult
) => void;

interface MaximizedMessageComposerState {
  isOpen: boolean;
  content: string | null;
  messageId: string | null;
  parentMessageId: string | null;
  onComplete?: MaximizedComposerCompleteCallback;
}

interface OpenMaximizedMessageComposerConfig {
  messageId?: string | null;
  content?: string | null;
  parentMessageId?: string | null;
  onComplete?: MaximizedComposerCompleteCallback;
}

interface MessageThreadState {
  messageId: string | null;
  isOpen: boolean;
}

interface PinnedMessagesState {
  isOpen: boolean;
}

interface MentionsSidebarState {
  isOpen: boolean;
}

interface ChannelState {
  infoSidebar: InfoSidebarState;
  maximizedMessageComposer: MaximizedMessageComposerState;
  messageThread: MessageThreadState;
  pinnedMessages: PinnedMessagesState;
  mentionsSidebar: MentionsSidebarState;

  openInfoSidebar: () => void;
  closeInfoSidebar: () => void;

  openMaximizedMessageComposer: (
    config?: OpenMaximizedMessageComposerConfig
  ) => void;
  closeMaximizedMessageComposer: () => void;

  openMessageThread: (messageId: string) => void;
  closeMessageThread: () => void;

  openPinnedMessages: () => void;
  closePinnedMessages: () => void;

  openMentionsSidebar: () => void;
  closeMentionsSidebar: () => void;
}

const defaultMaximizedComposerState: MaximizedMessageComposerState = {
  isOpen: false,
  messageId: null,
  content: null,
  parentMessageId: null,
  onComplete: undefined,
};

const useChannelStore = create<ChannelState>((set) => ({
  infoSidebar: { isOpen: false },
  maximizedMessageComposer: { ...defaultMaximizedComposerState },
  pinnedMessages: {
    isOpen: false,
  },
  mentionsSidebar: {
    isOpen: false,
  },
  messageThread: {
    messageId: null,
    isOpen: false,
  },

  openInfoSidebar: () => set({ infoSidebar: { isOpen: true } }),
  closeInfoSidebar: () => set({ infoSidebar: { isOpen: false } }),

  openMaximizedMessageComposer: (config = {}) =>
    set({
      maximizedMessageComposer: {
        ...defaultMaximizedComposerState,
        isOpen: true,
        content: config.content ?? null,
        messageId: config.messageId ?? null,
        parentMessageId: config.parentMessageId ?? null,
        onComplete: config.onComplete,
      },
    }),

  closeMaximizedMessageComposer: () =>
    set({ maximizedMessageComposer: { ...defaultMaximizedComposerState } }),

  openMessageThread: (messageId) =>
    set({ messageThread: { messageId, isOpen: true } }),
  closeMessageThread: () =>
    set({ messageThread: { messageId: null, isOpen: false } }),
  openPinnedMessages: () => set({ pinnedMessages: { isOpen: true } }),
  closePinnedMessages: () => set({ pinnedMessages: { isOpen: false } }),
  openMentionsSidebar: () =>
    set({ mentionsSidebar: { isOpen: true } }),
  closeMentionsSidebar: () =>
    set({ mentionsSidebar: { isOpen: false } }),
}));

export function useChannel(channelId: string) {
  const { data: channel } = useSuspenseQuery(
    queryUtils.communication.channel.get.queryOptions({ input: { channelId } })
  );

  const { data: membersList = [], isLoading } = useSuspenseQuery(
    queryUtils.communication.channel.listMembers.queryOptions({
      input: {
        channelId,
      },
    })
  );

  const { onlineUserIds } = useChannelPresence(channelId);

  const channelMembers = useMemo<ChannelMember[]>(
    () =>
      membersList.map((member) => ({
        ...member,
        isOnline: onlineUserIds.includes(member.id),
      })),
    [membersList, onlineUserIds]
  );

  const onlineUsersCount = onlineUserIds.length;

  return {
    channel,
    channelMembers,
    onlineUsersCount,
    isLoading,
  };
}

export function useChannelInfoSidebar() {
  const isOpen = useChannelStore((state) => state.infoSidebar.isOpen);
  const openInfoSidebar = useChannelStore((state) => state.openInfoSidebar);
  const closeInfoSidebar = useChannelStore((state) => state.closeInfoSidebar);

  const toggleInfoSidebar = () =>
    isOpen ? closeInfoSidebar() : openInfoSidebar();

  return { isOpen, openInfoSidebar, closeInfoSidebar, toggleInfoSidebar };
}

export function usePinnedMessagesSidebar() {
  const isOpen = useChannelStore((state) => state.pinnedMessages.isOpen);

  const openPinnedMessages = useChannelStore(
    (state) => state.openPinnedMessages
  );

  const closePinnedMessages = useChannelStore(
    (state) => state.closePinnedMessages
  );

  const togglePinnedMessages = isOpen
    ? closePinnedMessages
    : openPinnedMessages;

  return {
    isOpen,
    openPinnedMessages,
    closePinnedMessages,
    togglePinnedMessages,
  };
}

export function useMentionsSidebar() {
  const isOpen = useChannelStore((state) => state.mentionsSidebar.isOpen);

  const openMentionsSidebar = useChannelStore(
    (state) => state.openMentionsSidebar
  );

  const closeMentionsSidebar = useChannelStore(
    (state) => state.closeMentionsSidebar
  );

  const toggleMentionsSidebar = isOpen
    ? closeMentionsSidebar
    : openMentionsSidebar;

  return {
    isOpen,
    openMentionsSidebar,
    closeMentionsSidebar,
    toggleMentionsSidebar,
  };
}

export function useMessageThreadSidebar() {
  const isOpen = useChannelStore((state) => state.messageThread.isOpen);
  const messageId = useChannelStore(
    (state) => state.messageThread.messageId
  ) as string;
  const openMessageThread = useChannelStore((state) => state.openMessageThread);
  const closeMessageThread = useChannelStore(
    (state) => state.closeMessageThread
  );

  return {
    isOpen,
    messageId,
    openMessageThread,
    closeMessageThread,
  };
}

export function useMaximizedMessageComposer() {
  const isOpen = useChannelStore(
    (state) => state.maximizedMessageComposer.isOpen
  );

  const content = useChannelStore(
    (state) => state.maximizedMessageComposer.content
  );

  const messageId = useChannelStore(
    (state) => state.maximizedMessageComposer.messageId
  );

  const parentMessageId = useChannelStore(
    (state) => state.maximizedMessageComposer.parentMessageId
  );

  const onComplete = useChannelStore(
    (state) => state.maximizedMessageComposer.onComplete
  );

  const openMaximizedMessageComposer = useChannelStore(
    (state) => state.openMaximizedMessageComposer
  );

  const closeMaximizedMessageComposer = useChannelStore(
    (state) => state.closeMaximizedMessageComposer
  );

  return {
    isOpen,
    content,
    messageId,
    parentMessageId,
    onComplete,
    openMaximizedMessageComposer,
    closeMaximizedMessageComposer,
  };
}

export function useMaximizedMessageComposerActions() {
  const openMaximizedMessageComposer = useChannelStore(
    (state) => state.openMaximizedMessageComposer
  );

  return { openMaximizedMessageComposer };
}
