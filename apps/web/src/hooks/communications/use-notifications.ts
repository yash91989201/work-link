import type { RealtimeChannel } from "@supabase/supabase-js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { supabase } from "@/lib/supabase";
import { queryClient, queryUtils } from "@/utils/orpc";

interface UseNotificationsOptions {
  filters?: {
    type?:
      | "message"
      | "mention"
      | "channel_invite"
      | "direct_message"
      | "announcement"
      | "system";
    status?: "unread" | "read" | "dismissed";
    limit?: number;
  };
}

export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const { filters } = options;
  const { user } = useAuthedSession();
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel>(null);

  // Query for notifications
  // const query = useQuery({
  //   queryKey: ["notifications", "list", user?.id, filters],
  //   queryFn: async () => {
  //     if (!user?.id) return { notifications: [], total: 0, hasMore: false };
  //
  //     const result = await queryUtils.communication.notifications.list({
  //       limit: filters?.limit || 50,
  //       offset: 0,
  //       type: filters?.type,
  //       status: filters?.status,
  //     });
  //
  //     return result;
  //   },
  //   enabled: !!user?.id,
  //   refetchInterval: enableRealtime ? undefined : 30_000,
  // });
  const query = useQuery(
    queryUtils.communication.notifications.list.queryOptions({
      input: {
        limit: filters?.limit || 50,
        offset: 0,
        type: filters?.type,
        status: filters?.status,
      },
    })
  );

  // Setup realtime subscription
  useEffect(() => {
    const channelName = `notifications:${user.id}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log(payload);
          // const newNotification = payload.new as any;
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Invalidate query to refetch updated notifications
          queryClient.invalidateQueries({
            queryKey: queryUtils.communication.notifications.list.queryKey({
              input: {},
            }),
          });
        }
      )
      .subscribe((status) => {
        console.log(`Notifications realtime connection status: ${status}`);
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
  }, [user.id]);

  return {
    ...query,
    isConnected,
  };
};

export const useUnreadNotificationsCount = () => {
  const { user } = useAuthedSession();
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel>(null);

  const query = useQuery(
    queryUtils.communication.notifications.getUnreadCount.queryOptions({})
  );

  // Setup realtime subscription for count updates
  useEffect(() => {
    const channelName = `notifications-count:${user.id}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Invalidate count query on any notification change
          queryClient.invalidateQueries({
            queryKey: ["notifications", "unreadCount", user.id],
          });
        }
      )
      .subscribe((status) => {
        console.log(
          `Notifications count realtime connection status: ${status}`
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
  }, [user.id]);

  return {
    ...query,
    isConnected,
  };
};

// Mutation hooks following the documented pattern
export const useMarkNotificationAsRead = () => {
  return useMutation(
    queryUtils.communication.notifications.markAsRead.mutationOptions({
      onSuccess: () => {
        // Invalidate related queries
        queryClient.invalidateQueries({
          queryKey: queryUtils.communication.notifications.list.queryKey({
            input: {},
          }),
        });
        queryClient.invalidateQueries({
          queryKey:
            queryUtils.communication.notifications.getUnreadCount.queryKey(),
        });

        toast.success("Notification marked as read");
      },
    })
  );
};

export const useMarkMultipleNotificationsAsRead = () => {
  return useMutation(
    queryUtils.communication.notifications.markMultipleAsRead.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryUtils.communication.notifications.list.queryKey({
            input: {},
          }),
        });
        queryClient.invalidateQueries({
          queryKey:
            queryUtils.communication.notifications.getUnreadCount.queryKey(),
        });

        toast.success("Notifications marked as read");
      },
    })
  );
};

export const useMarkAllNotificationsAsRead = () => {
  return useMutation(
    queryUtils.communication.notifications.markAllAsRead.mutationOptions({
      onSuccess: () => {
        // Invalidate all notification queries
        queryClient.invalidateQueries({
          queryKey: queryUtils.communication.notifications.list.queryKey({
            input: {},
          }),
        });

        queryClient.invalidateQueries({
          queryKey:
            queryUtils.communication.notifications.getUnreadCount.queryKey(),
        });

        toast.success("All notifications marked as read");
      },
    })
  );
};

export const useDismissNotification = () => {
  return useMutation(
    queryUtils.communication.notifications.dismiss.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryUtils.communication.notifications.list.queryKey({
            input: {},
          }),
        });

        queryClient.invalidateQueries({
          queryKey:
            queryUtils.communication.notifications.getUnreadCount.queryKey(),
        });

        toast.success("Notification dismissed");
      },
    })
  );
};

export const useDeleteNotification = () => {
  return useMutation(
    queryUtils.communication.notifications.delete.mutationOptions({
      onSuccess: () => {
        // Invalidate related queries
        queryClient.invalidateQueries({
          queryKey: queryUtils.communication.notifications.list.queryKey({
            input: {},
          }),
        });

        queryClient.invalidateQueries({
          queryKey:
            queryUtils.communication.notifications.getUnreadCount.queryKey(),
        });

        toast.success("Notification deleted");
      },
    })
  );
};

export const useCreateNotification = () => {
  return useMutation(
    queryUtils.communication.notifications.create.mutationOptions({
      onSuccess: () => {
        // Invalidate notifications list to show new notification
        queryClient.invalidateQueries({
          queryKey: queryUtils.communication.notifications.list.queryKey({
            input: {},
          }),
        });

        toast.success("Notification created");
      },
    })
  );
};

export const useCreateBulkNotifications = () => {
  return useMutation(
    queryUtils.communication.notifications.createBulk.mutationOptions({
      onSuccess: () => {
        // Invalidate all notification queries for affected users
        // Note: In a real app, you might want to be more specific about which users to invalidate
        queryClient.invalidateQueries({
          queryKey: queryUtils.communication.notifications.list.queryKey({
            input: {},
          }),
        });

        toast.success("Bulk notifications created");
      },
    })
  );
};

export const useCreateChannelInviteNotification = () => {
  return useMutation(
    queryUtils.communication.notifications.createChannelInvite.mutationOptions({
      onSuccess: () => {
        // Invalidate notifications for the invited user
        queryClient.invalidateQueries({
          queryKey: queryUtils.communication.notifications.list.queryKey({
            input: {},
          }),
        });

        toast.success("Channel invite notification sent");
      },
    })
  );
};

export const useCreateSystemNotification = () => {
  return useMutation(
    queryUtils.communication.notifications.createSystem.mutationOptions({
      onSuccess: () => {
        // Invalidate notifications for all target users
        queryClient.invalidateQueries({
          queryKey: queryUtils.communication.notifications.list.queryKey({
            input: {},
          }),
        });

        toast.success("System notification sent");
      },
    })
  );
};

export const useCreateAnnouncementNotification = () => {
  return useMutation(
    queryUtils.communication.notifications.createAnnouncement.mutationOptions({
      onSuccess: () => {
        // Invalidate notifications for all organization members
        queryClient.invalidateQueries({
          queryKey: queryUtils.communication.notifications.list.queryKey({
            input: {},
          }),
        });

        toast.success("Announcement sent to all members");
      },
    })
  );
};
