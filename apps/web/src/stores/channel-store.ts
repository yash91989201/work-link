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

interface ChannelState {
  infoSidebar: {
    isOpen: boolean;
  };
  openInfoSidebar: () => void;
  closeInfoSidebar: () => void;
}

const useChannelStore = create<ChannelState>((set) => ({
  infoSidebar: { isOpen: false },

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
    channelId,
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
