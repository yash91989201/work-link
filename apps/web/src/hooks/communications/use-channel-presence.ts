import type { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { supabase } from "@/lib/supabase";

interface PresencePayload {
  user_id: string;
  status?: "online" | "away" | "offline";
}

export const useChannelPresence = (channelId: string | null) => {
  const { user } = useAuthedSession();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }

    if (!(channelId && user)) {
      setOnlineUserIds([]);
      return;
    }

    const presenceChannel = supabase
      .channel(`org:channels:${channelId}:presence`)
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState<PresencePayload>();
        const idsSet = new Set<string>();

        for (const presences of Object.values(state)) {
          for (const p of presences) {
            if (p.user_id) idsSet.add(p.user_id);
          }
        }

        setOnlineUserIds(Array.from(idsSet));
      })
      .on(
        "presence",
        { event: "join" },
        ({ currentPresences }: { currentPresences: PresencePayload[] }) => {
          setOnlineUserIds((prev) => {
            const idsSet = new Set(prev);
            for (const p of currentPresences) {
              if (p.user_id) {
                idsSet.add(p.user_id);
              }
            }
            return Array.from(idsSet);
          });
        }
      )
      .on(
        "presence",
        { event: "leave" },
        ({ leftPresences }: { leftPresences: PresencePayload[] }) => {
          setOnlineUserIds((prev) =>
            prev.filter((id) => !leftPresences.some((p) => p.user_id === id))
          );
        }
      )
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({ user_id: user.id });
        }
      });

    channelRef.current = presenceChannel;

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [channelId, user]);

  return {
    onlineUserIds,
  };
};
