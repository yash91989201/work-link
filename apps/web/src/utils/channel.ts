import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export const channelInstances = new Map<string, RealtimeChannel>();

export function getRealtimeChannel(channelId: string): RealtimeChannel {
  const existingChannel = channelInstances.get(channelId);
  if (existingChannel) {
    return existingChannel;
  }

  const channel = supabase.channel(`org:channel:${channelId}`, {
    config: {
      broadcast: {
        ack: false,
        self: false,
      },
    },
  });

  channelInstances.set(channelId, channel);

  return channel;
}
