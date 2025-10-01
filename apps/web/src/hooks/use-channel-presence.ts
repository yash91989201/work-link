import type { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { supabase } from "@/lib/supabase";

interface PresenceUser {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  online_at: string;
}

interface UseChannelPresenceReturn {
  presentUsers: PresenceUser[];
  isPresent: boolean;
  channel: RealtimeChannel | null;
}

export const useChannelPresence = (
  channelId: string
): UseChannelPresenceReturn => {
  const [presentUsers, setPresentUsers] = useState<PresenceUser[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const { user } = useAuthedSession();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!channelId) {
      return;
    }

    const channelName = `channel:${channelId}`;

    // Create channel with custom presence key using user ID
    const newChannel = supabase.channel(channelName, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Handle presence sync
    newChannel.on("presence", { event: "sync" }, () => {
      const presenceState = newChannel.presenceState<PresenceUser>();
      const users: PresenceUser[] = [];

      for (const presences of Object.values(presenceState)) {
        for (const presence of presences) {
          users.push({
            user: presence.user,
            online_at: presence.online_at,
          });
        }
      }

      setPresentUsers(users);
    });

    // Handle user joining
    newChannel.on<PresenceUser>(
      "presence",
      { event: "join" },
      ({ key, newPresences }) => {
        console.log("User joined channel:", key, newPresences);
      }
    );

    // Handle user leaving
    newChannel.on<PresenceUser>(
      "presence",
      { event: "leave" },
      ({ key, leftPresences }) => {
        console.log("User left channel:", key, leftPresences);
      }
    );

    // Subscribe to the channel
    newChannel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await newChannel.track({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          },
          online_at: new Date().toISOString(),
        });
      }
    });

    channelRef.current = newChannel;
    setChannel(newChannel);

    // Cleanup function
    return () => {
      if (channelRef.current) {
        channelRef.current.untrack();
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [channelId, user.id, user.name, user.email, user.image]);

  const isPresent = presentUsers.some((p) => p.user.id === user.id);

  return {
    presentUsers,
    isPresent,
    channel,
  };
};

