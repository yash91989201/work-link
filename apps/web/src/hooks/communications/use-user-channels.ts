import { and, eq, useLiveQuery } from "@tanstack/react-db";
import { channelMembersCollection, channelsCollection } from "@/db/collections";
import { useAuthedSession } from "@/hooks/use-authed-session";

export function useUserChannels() {
  const { session } = useAuthedSession();
  const organizationId = session.activeOrganizationId;

  const { data: channels = [] } = useLiveQuery((q) => {
    if (!organizationId) {
      throw new Error("No active organization");
    }

    return q
      .from({ channel: channelsCollection })
      .innerJoin({ member: channelMembersCollection }, ({ channel, member }) =>
        eq(channel.id, member.channelId)
      )
      .where(({ member, channel }) =>
        and(
          eq(member.userId, session.userId),
          eq(channel.organizationId, organizationId)
        )
      )
      .select(({ channel }) => ({ ...channel }));
  });

  return { channels };
}
