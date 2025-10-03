import { createContext, type ReactNode, useContext, useMemo } from "react";
import { useChannelMembers } from "@/hooks/communications/use-channel-members";

interface ChannelMember {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

interface ChannelContextValue {
  channelId: string;
  channelMembers: ChannelMember[];
  isLoading: boolean;
}

const ChannelContext = createContext<ChannelContextValue | null>(null);

interface ChannelProviderProps {
  channelId: string;
  children: ReactNode;
}

export function ChannelProvider({ channelId, children }: ChannelProviderProps) {
  const { data: membersData, isLoading } = useChannelMembers(channelId);

  const value = useMemo(
    () => ({
      channelId,
      channelMembers: membersData?.members || [],
      isLoading,
    }),
    [channelId, membersData, isLoading]
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
