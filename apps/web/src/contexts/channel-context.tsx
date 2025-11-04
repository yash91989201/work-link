import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import type { GetChannelOutputType } from "@work-link/api/lib/types";
import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { useChannelPresence } from "@/hooks/communications/use-channel-presence";
import { queryUtils } from "@/utils/orpc";

interface ChannelContextValue {
  channelId: string;
  channel: GetChannelOutputType;
  channelMembers: {
    id: string;
    name: string;
    email: string;
    image?: string | null | undefined;
    isOnline: boolean;
  }[];
  onlineUsersCount: number;
  isLoading: boolean;
  showChannelInfoSidebar: boolean;
  setShowChannelInfoSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChannelContext = createContext<ChannelContextValue | null>(null);

interface ChannelProviderProps {
  channelId: string;
  children: ReactNode;
}

export function ChannelProvider({ channelId, children }: ChannelProviderProps) {
  const [showChannelInfoSidebar, setShowChannelInfoSidebar] = useState(false);
  const { data: channel } = useSuspenseQuery(
    queryUtils.communication.channel.get.queryOptions({ input: { channelId } })
  );

  const { data: membersList = [], isLoading } = useQuery(
    queryUtils.communication.channel.listMembers.queryOptions({
      input: {
        channelId,
      },
    })
  );

  const { onlineUserIds } = useChannelPresence(channelId);

  const membersWithActiveStatus = useMemo(
    () =>
      membersList.map((member) => ({
        ...member,
        isOnline: onlineUserIds.includes(member.id),
      })),
    [membersList, onlineUserIds]
  );

  const value = useMemo(
    () => ({
      channelId,
      channelMembers: membersWithActiveStatus,
      onlineUsersCount: onlineUserIds.length,
      isLoading,
      channel,
      showChannelInfoSidebar,
      setShowChannelInfoSidebar,
    }),
    [
      channel,
      channelId,
      isLoading,
      membersWithActiveStatus,
      onlineUserIds.length,
      showChannelInfoSidebar,
    ]
  );

  return (
    <ChannelContext.Provider value={value}>{children}</ChannelContext.Provider>
  );
}

export function useChannelContext() {
  const context = useContext(ChannelContext);
  if (!context) {
    throw new Error("useChannelContext must be used within ChannelProvider");
  }
  return context;
}
