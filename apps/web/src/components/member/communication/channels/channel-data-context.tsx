import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createContext,
  type PropsWithChildren,
  useContext,
} from "react";
import { queryUtils } from "@/utils/orpc";

type Channel = Awaited<
  ReturnType<
    (typeof queryUtils)["communication"]["channel"]["get"]["queryFn"]
  >
>;
type ChannelMember = Awaited<
  ReturnType<
    (typeof queryUtils)["communication"]["channel"]["listMembers"]["queryFn"]
  >
>[number];

interface ChannelDataContextValue {
  channel: Channel;
  members: ChannelMember[];
}

const ChannelDataContext = createContext<ChannelDataContextValue | null>(null);

export function ChannelDataProvider({
  channelId,
  children,
}: PropsWithChildren<{ channelId: string }>) {
  const { data: channel } = useSuspenseQuery(
    queryUtils.communication.channel.get.queryOptions({
      input: { channelId },
    })
  );

  const { data: members = [] } = useSuspenseQuery(
    queryUtils.communication.channel.listMembers.queryOptions({
      input: { channelId },
    })
  );

  return (
    <ChannelDataContext.Provider value={{ channel, members }}>
      {children}
    </ChannelDataContext.Provider>
  );
}

export function useChannelData() {
  const context = useContext(ChannelDataContext);

  if (context === null) {
    throw new Error(
      "useChannelData must be used within a ChannelDataProvider"
    );
  }

  return context;
}
