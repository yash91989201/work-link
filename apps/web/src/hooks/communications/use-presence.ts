import type { ChannelMemberOutput } from "@server/lib/schemas/channel";
import type {
  UpdatePresenceInput,
  UserPresenceInfo,
} from "@server/lib/schemas/presence";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { supabase } from "@/lib/supabase";
import { queryUtils } from "@/utils/orpc";

type PresenceStatus = UpdatePresenceInput["status"];

type PresenceListItem = {
  id: string;
  name: string;
  avatar?: string;
  status: PresenceStatus;
  customStatus?: string;
  lastSeen?: Date;
  currentChannel?: string;
  isTyping?: boolean;
};

export const useUserPresence = (
  userId?: string,
  options?: { enableRealtime?: boolean }
) => {
  const { enableRealtime = true } = options || {};
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<any>(null);

  // Query for user presence
  const query = useQuery({
    queryKey: ["presence", "user", userId],
    queryFn: async () => {
      if (!userId) return null;

      const result = await queryUtils.communication.presence.getUserPresence({
        userId,
      });

      return result;
    },
    enabled: !!userId,
    refetchInterval: enableRealtime ? undefined : 60_000,
  });

  // Setup realtime subscription for user presence updates
  useEffect(() => {
    if (!(enableRealtime && userId)) {
      return;
    }

    const channelName = `presence:user:${userId}`;
    const channel = supabase
      .channel(channelName)
      .on("presence", { event: "sync" }, () => {
        // Invalidate query to get latest presence data
        queryClient.invalidateQueries({
          queryKey: ["presence", "user", userId],
        });
      })
      .on("presence", { event: "join" }, ({ key, currentPresences }) => {
        // User came online
        if (key === `user:${userId}`) {
          queryClient.invalidateQueries({
            queryKey: ["presence", "user", userId],
          });
        }
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        // User went offline
        if (key === `user:${userId}`) {
          queryClient.invalidateQueries({
            queryKey: ["presence", "user", userId],
          });
        }
      })
      .subscribe((status) => {
        console.log(
          `User presence realtime connection status for ${userId}: ${status}`
        );
        setIsConnected(status === "SUBSCRIBED");
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [userId, enableRealtime, queryClient]);

  return {
    ...query,
    isConnected,
  };
};

export const useUpdatePresence = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthedSession();

  return queryUtils.communication.presence.updatePresence.useMutation({
    onSuccess: (data) => {
      // Update cache with new presence data
      if (user?.id) {
        queryClient.setQueryData(["presence", "user", user.id], data);
      }

      const statusMessages: Record<PresenceStatus, string> = {
        online: "Status updated to online",
        away: "Status updated to away",
        busy: "Status updated to busy",
        offline: "Status updated to offline",
      };

      toast.success(statusMessages[data.status]);
    },
    onError: (error: any) => {
      toast.error(`Failed to update presence: ${error.message}`);
    },
  });
};

export const usePresence = (
  channelId?: string,
  options?: { enableRealtime?: boolean }
) => {
  const { enableRealtime = true } = options || {};
  const { session, user } = useAuthedSession();
  const userId = user?.id;
  const organizationId = session?.activeOrganizationId;
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<any>(null);

  // Query for channel members or organization presence
  const membersQuery = useQuery({
    queryKey: ["channels", "members", channelId],
    queryFn: async () => {
      if (!channelId) return { members: [] };

      const result = await queryUtils.communication.channel.getMembers({
        channelId,
        limit: 100,
        offset: 0,
      });

      return result;
    },
    enabled: !!channelId,
    refetchInterval: enableRealtime ? undefined : 60_000,
  });

  const memberIds =
    membersQuery.data?.members
      ?.map((member) => member.userId)
      .filter((id): id is string => Boolean(id)) || [];

  const memberPresenceQuery = useQuery({
    queryKey: ["presence", "multiple", memberIds],
    queryFn: async () => {
      if (memberIds.length === 0) return [];

      const result =
        await queryUtils.communication.presence.getMultipleUserPresence({
          userIds: memberIds,
        });

      return result;
    },
    enabled: channelId ? memberIds.length > 0 : false,
    refetchInterval: enableRealtime ? undefined : 30_000,
  });

  const organizationPresenceQuery = useQuery({
    queryKey: ["presence", "organization", organizationId],
    queryFn: async () => {
      if (!organizationId || channelId) return [];

      const result =
        await queryUtils.communication.presence.getOrganizationOnlineUsers({
          organizationId,
        });

      return result;
    },
    enabled: !channelId && Boolean(organizationId),
    refetchInterval: enableRealtime ? undefined : 30_000,
  });

  // Setup realtime subscription for presence updates
  useEffect(() => {
    const targetId = channelId || organizationId;
    if (!(enableRealtime && targetId)) {
      return;
    }

    const channelName = `presence:${targetId}`;
    const channel = supabase
      .channel(channelName)
      .on("presence", { event: "sync" }, () => {
        // Invalidate all presence queries for this target
        if (channelId) {
          queryClient.invalidateQueries({
            queryKey: ["presence", "multiple", memberIds],
          });
        } else {
          queryClient.invalidateQueries({
            queryKey: ["presence", "organization", organizationId],
          });
        }
      })
      .on("presence", { event: "join" }, ({ key, currentPresences }) => {
        console.log(`User joined: ${key}`, currentPresences);
        // Invalidate queries to update presence list
        if (channelId) {
          queryClient.invalidateQueries({
            queryKey: ["presence", "multiple", memberIds],
          });
        } else {
          queryClient.invalidateQueries({
            queryKey: ["presence", "organization", organizationId],
          });
        }
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        console.log(`User left: ${key}`);
        // Invalidate queries to update presence list
        if (channelId) {
          queryClient.invalidateQueries({
            queryKey: ["presence", "multiple", memberIds],
          });
        } else {
          queryClient.invalidateQueries({
            queryKey: ["presence", "organization", organizationId],
          });
        }
      })
      .subscribe((status) => {
        console.log(
          `Presence realtime connection status for ${targetId}: ${status}`
        );
        setIsConnected(status === "SUBSCRIBED");
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [channelId, organizationId, enableRealtime, queryClient, memberIds]);

  // Track current user's presence
  useEffect(() => {
    if (!(enableRealtime && userId && channelRef.current)) {
      return;
    }

    const trackPresence = async () => {
      try {
        await channelRef.current.track({
          user_id: userId,
          status: "online",
          channel_id: channelId,
          updated_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Failed to track presence:", error);
      }
    };

    trackPresence();

    // Update presence periodically
    const interval = setInterval(trackPresence, 30_000);

    return () => {
      clearInterval(interval);
    };
  }, [userId, channelId, enableRealtime]);

  // Process presence data
  const presenceByUserId = new Map<string, UserPresenceInfo>(
    memberPresenceQuery.data?.map((presence) => [presence.userId, presence]) ||
      []
  );

  const presenceList = useMemo<PresenceListItem[]>(() => {
    if (channelId) {
      const members = membersQuery.data?.members || [];

      return members.map<PresenceListItem>((member: ChannelMemberOutput) => {
        const presence = member.userId
          ? presenceByUserId.get(member.userId)
          : undefined;

        return {
          id: member.userId || member.id,
          name: member.userName || "Unknown member",
          avatar: member.userImage || undefined,
          status: presence?.status || "offline",
          customStatus: presence?.customStatus || undefined,
          lastSeen: presence?.lastSeen || undefined,
          currentChannel: presence?.currentChannelId || undefined,
          isTyping: false,
        };
      });
    }

    const organizationPresence = organizationPresenceQuery.data || [];

    return organizationPresence.map<PresenceListItem>(
      (presence: UserPresenceInfo) => ({
        id: presence.userId,
        name: presence.userName || "Unknown member",
        avatar: presence.userImage || undefined,
        status: presence.status,
        customStatus: presence.customStatus || undefined,
        lastSeen: presence.lastSeen || undefined,
        currentChannel: presence.currentChannelId || undefined,
        isTyping: false,
      })
    );
  }, [
    channelId,
    membersQuery.data?.members,
    organizationPresenceQuery.data,
    presenceByUserId,
  ]);

  const updateStatus = useUpdatePresence();

  const isLoading = channelId
    ? membersQuery.isLoading ||
      (memberIds.length > 0 && memberPresenceQuery.isLoading)
    : organizationPresenceQuery.isLoading;

  return {
    presenceList,
    isLoading,
    isConnected,
    updateStatus,
  };
};

// Helper hook for tracking typing status in a channel
export const useTypingPresence = (channelId: string) => {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const channelRef = useRef<RealtimeChannel>(null);

  useEffect(() => {
    const channelName = `typing:${channelId}`;
    const channel = supabase
      .channel(channelName)
      .on("broadcast", { event: "typing" }, (payload) => {
        const { userId, isTyping } = payload.payload as any;

        if (isTyping) {
          setTypingUsers((prev) => {
            if (!prev.includes(userId)) {
              return [...prev, userId];
            }
            return prev;
          });
        } else {
          setTypingUsers((prev) => prev.filter((id) => id !== userId));
        }

        // Clear typing indicator after 3 seconds of inactivity
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((id) => id !== userId));
        }, 3000);
      })
      .subscribe((status) => {
        console.log(
          `Typing presence connection status for ${channelId}: ${status}`
        );
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setTypingUsers([]);
    };
  }, [channelId]);

  const broadcastTyping = (isTyping: boolean) => {
    if (!(channelId && channelRef.current)) return;

    channelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: {
        userId,
        isTyping,
        timestamp: new Date().toISOString(),
      },
    });
  };

  return {
    typingUsers,
    broadcastTyping,
  };
};

import { useMemo } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
