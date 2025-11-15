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

interface MessageThreadState {
  messageId: string | null;
  isOpen: boolean;
}

interface PinnedMessagesState {
  isOpen: boolean;
}

interface ChannelState {
  infoSidebar: {
    isOpen: boolean;
  };
  messageThread: MessageThreadState;
  pinnedMessages: PinnedMessagesState;
  openInfoSidebar: () => void;
  closeInfoSidebar: () => void;
  openMessageThread: (messageId: string) => void;
  closeMessageThread: () => void;
  openPinnedMessages: () => void;
  closePinnedMessages: () => void;
}

const useChannelStore = create<ChannelState>((set) => ({
  infoSidebar: { isOpen: false },
  pinnedMessages: {
    isOpen: false,
  },
  messageThread: {
    messageId: null,
    isOpen: false,
  },

  openInfoSidebar: () =>
    set({
      infoSidebar: {
        isOpen: true,
      },
    }),
  closeInfoSidebar: () =>
    set({
      infoSidebar: {
        isOpen: false,
      },
    }),
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

  const toggleInfoSidebar = () => {
    if (isOpen) {
      closeInfoSidebar();
    } else {
      openInfoSidebar();
    }
  };

  return {
    isOpen,
    openInfoSidebar,
    closeInfoSidebar,
    toggleInfoSidebar,
  };
}

export function usePinnedMessagesSidebar() {
  const isOpen = useChannelStore((state) => state.pinnedMessages.isOpen);

  const openPinnedMessages = useChannelStore(
    (state) => state.openPinnedMessages
  );

  const closePinnedMessages = useChannelStore(
    (state) => state.closePinnedMessages
  );

  return {
    isOpen,
    openPinnedMessages,
    closePinnedMessages,
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
