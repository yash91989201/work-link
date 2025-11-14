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
  showChannelInfoSidebar: boolean;
  setShowChannelInfoSidebar: (show: boolean) => void;
  toggleChannelInfoSidebar: () => void;
}

const useChannelStore = create<ChannelState>((set) => ({
  showChannelInfoSidebar: false,
  setShowChannelInfoSidebar: (show) => set({ showChannelInfoSidebar: show }),
  toggleChannelInfoSidebar: () =>
    set((state) => ({ showChannelInfoSidebar: !state.showChannelInfoSidebar })),
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

export function useChannelSidebar() {
  const showChannelInfoSidebar = useChannelStore(
    (state) => state.showChannelInfoSidebar
  );

  const setShowChannelInfoSidebar = useChannelStore(
    (state) => state.setShowChannelInfoSidebar
  );

  const toggleChannelInfoSidebar = useChannelStore(
    (state) => state.toggleChannelInfoSidebar
  );

  return {
    showChannelInfoSidebar,
    setShowChannelInfoSidebar,
    toggleChannelInfoSidebar,
  };
}

export type { ChannelMember, ChannelState };
