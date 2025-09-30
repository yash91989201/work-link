import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
export const REALTIME_CHANNELS = {
  MESSAGES: "messages",
  PRESENCE: "presence",
  NOTIFICATIONS: "notifications",
} as const;

export interface RealtimePostgresChangesPayload<T = any> {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  old: T | null;
  new: T | null;
  errors: any[];
}

export interface RealtimePresencePayload {
  key: string;
  currentPresences: any[];
  leftPresences: any[];
}

export interface RealtimeBroadcastPayload {
  event: string;
  payload: any;
  createdAt: string;
}

export class CommunicationsRealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private subscriptions: Map<string, Set<(payload: any) => void>> = new Map();

  // Subscribe to messages table changes for a specific channel
  subscribeToChannelMessages(
    channelId: string,
    callback: (payload: RealtimePostgresChangesPayload) => void
  ) {
    const channelName = `${REALTIME_CHANNELS.MESSAGES}:${channelId}`;

    if (!this.subscriptions.has(channelName)) {
      this.subscriptions.set(channelName, new Set());
    }

    this.subscriptions.get(channelName)!.add(callback);

    if (!this.channels.has(channelName)) {
      const channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages",
            filter: `channel_id=eq.${channelId}`,
          },
          (payload) => {
            this.notifySubscribers(channelName, payload);
          }
        )
        .subscribe((status) => {
          console.log(
            `Messages realtime connection status for ${channelName}:`,
            status
          );
        });

      this.channels.set(channelName, channel);
    }

    return () => {
      this.unsubscribe(channelName, callback);
    };
  }

  // Subscribe to user presence updates
  subscribeToPresence(
    targetId: string, // Can be channelId or organizationId
    callback: (payload: RealtimePresencePayload) => void
  ) {
    const channelName = `${REALTIME_CHANNELS.PRESENCE}:${targetId}`;

    if (!this.subscriptions.has(channelName)) {
      this.subscriptions.set(channelName, new Set());
    }

    this.subscriptions.get(channelName)!.add(callback);

    if (!this.channels.has(channelName)) {
      const channel = supabase
        .channel(channelName)
        .on("presence", { event: "sync" }, () => {
          const newState = channel.presenceState();
          callback({
            key: "sync",
            currentPresences: Object.values(newState).flat(),
            leftPresences: [],
          });
        })
        .on(
          "presence",
          { event: "join" },
          ({ key, currentPresences, newPresences }) => {
            callback({
              key,
              currentPresences,
              leftPresences: [],
            });
          }
        )
        .on(
          "presence",
          { event: "leave" },
          ({ key, currentPresences, leftPresences }) => {
            callback({
              key,
              currentPresences,
              leftPresences,
            });
          }
        )
        .subscribe((status) => {
          console.log(
            `Presence realtime connection status for ${channelName}:`,
            status
          );
        });

      this.channels.set(channelName, channel);
    }

    return () => {
      this.unsubscribe(channelName, callback);
    };
  }

  // Subscribe to notifications for a user
  subscribeToNotifications(
    userId: string,
    callback: (payload: RealtimePostgresChangesPayload) => void
  ) {
    const channelName = `${REALTIME_CHANNELS.NOTIFICATIONS}:${userId}`;

    if (!this.subscriptions.has(channelName)) {
      this.subscriptions.set(channelName, new Set());
    }

    this.subscriptions.get(channelName)!.add(callback);

    if (!this.channels.has(channelName)) {
      const channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            this.notifySubscribers(channelName, payload);
          }
        )
        .subscribe((status) => {
          console.log(
            `Notifications realtime connection status for ${channelName}:`,
            status
          );
        });

      this.channels.set(channelName, channel);
    }

    return () => {
      this.unsubscribe(channelName, callback);
    };
  }

  // Track user presence in a channel
  async trackUserPresence(
    userId: string,
    channelId?: string,
    status: "online" | "away" | "busy" | "offline" = "online",
    customStatus?: string
  ) {
    const channelName = channelId
      ? `${REALTIME_CHANNELS.PRESENCE}:${channelId}`
      : `${REALTIME_CHANNELS.PRESENCE}:global`;

    let channel = this.channels.get(channelName);

    if (!channel) {
      channel = supabase.channel(channelName);
      this.channels.set(channelName, channel);
    }

    const presenceKey = `user:${userId}`;

    await channel.track({
      user_id: userId,
      status,
      channel_id: channelId,
      custom_status: customStatus,
      updated_at: new Date().toISOString(),
    });

    return channel;
  }

  // Broadcast typing indicator
  async broadcastTypingStatus(
    channelId: string,
    userId: string,
    isTyping: boolean
  ) {
    const channelName = `${REALTIME_CHANNELS.MESSAGES}:${channelId}`;
    const channel = this.channels.get(channelName);

    if (channel) {
      await channel.send({
        type: "broadcast",
        event: "typing",
        payload: {
          userId,
          isTyping,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  // Subscribe to typing indicators
  subscribeToTyping(
    channelId: string,
    callback: (payload: {
      userId: string;
      isTyping: boolean;
      timestamp: string;
    }) => void
  ) {
    const channelName = `${REALTIME_CHANNELS.MESSAGES}:${channelId}`;

    if (!this.subscriptions.has(channelName)) {
      this.subscriptions.set(channelName, new Set());
    }

    this.subscriptions.get(channelName)!.add(callback);

    if (!this.channels.has(channelName)) {
      const channel = supabase
        .channel(channelName)
        .on("broadcast", { event: "typing" }, (payload) => {
          this.notifySubscribers(channelName, payload.payload);
        })
        .subscribe((status) => {
          console.log(
            `Typing realtime connection status for ${channelName}:`,
            status
          );
        });

      this.channels.set(channelName, channel);
    }

    return () => {
      this.unsubscribe(channelName, callback);
    };
  }

  // Untrack user presence
  async untrackUserPresence(userId: string, channelId?: string) {
    const channelName = channelId
      ? `${REALTIME_CHANNELS.PRESENCE}:${channelId}`
      : `${REALTIME_CHANNELS.PRESENCE}:global`;

    const channel = this.channels.get(channelName);
    if (channel) {
      await channel.untrack(`user:${userId}`);
    }
  }

  // Private helper methods
  private notifySubscribers(channelName: string, payload: any) {
    const callbacks = this.subscriptions.get(channelName);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(payload);
        } catch (error) {
          console.error("Error in realtime callback:", error);
        }
      });
    }
  }

  private unsubscribe(channelName: string, callback: (payload: any) => void) {
    const callbacks = this.subscriptions.get(channelName);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.subscriptions.delete(channelName);
        const channel = this.channels.get(channelName);
        if (channel) {
          supabase.removeChannel(channel);
          this.channels.delete(channelName);
        }
      }
    }
  }

  // Clean up all connections
  disconnectAll() {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
    this.subscriptions.clear();
  }
}

// Singleton instance for global use
export const communicationsRealtimeService =
  new CommunicationsRealtimeService();

