import type { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { supabase } from "@/lib/supabase";

export interface TypingUser {
  userId: string;
  userName: string;
}

export function useTypingIndicator(channelId: string) {
  const { user } = useAuthedSession();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    if (!user?.id) return;

    const channelName = `typing:${channelId}`;
    const channel = supabase
      .channel(channelName, {
        config: {
          broadcast: { self: false },
        },
      })
      .on("broadcast", { event: "typing" }, (payload) => {
        const { userId, userName, isTyping } = payload.payload as {
          userId: string;
          userName: string;
          isTyping: boolean;
        };

        // Ignore own typing events
        if (userId === user.id) return;

        // Clear existing timeout for this user
        const existingTimeout = typingTimeoutsRef.current.get(userId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        if (isTyping) {
          setTypingUsers((prev) => {
            if (!prev.some((u) => u.userId === userId)) {
              return [...prev, { userId, userName }];
            }
            return prev;
          });

          // Set timeout to clear typing indicator after 3 seconds
          const timeout = setTimeout(() => {
            setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
            typingTimeoutsRef.current.delete(userId);
          }, 3000);

          typingTimeoutsRef.current.set(userId, timeout);
        } else {
          setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
          typingTimeoutsRef.current.delete(userId);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      // Clear all timeouts
      for (const timeout of typingTimeoutsRef.current.values()) {
        clearTimeout(timeout);
      }

      typingTimeoutsRef.current.clear();

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setTypingUsers([]);
    };
  }, [channelId, user?.id]);

  const broadcastTyping = (isTyping: boolean, userName: string) => {
    if (!(channelRef.current && user?.id)) return;

    channelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: {
        userId: user.id,
        userName,
        isTyping,
        timestamp: new Date().toISOString(),
      },
    });
  };

  return {
    typingUsers,
    broadcastTyping,
  };
}
