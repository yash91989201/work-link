import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { queryUtils } from "@/utils/orpc";
import { useAuthedSession } from "@/hooks/use-authed-session";
import type { NotificationOutput } from "@server/lib/schemas/notification";

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
  enableRealtime?: boolean;
}

export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const { filters, enableRealtime = true } = options;
  const queryClient = useQueryClient();
  const { user } = useAuthedSession();
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<any>(null);

  // Query for notifications
  const query = useQuery({
    queryKey: ["notifications", "list", user?.id, filters],
    queryFn: async () => {
      if (!user?.id) return { notifications: [], total: 0, hasMore: false };

      const result = await queryUtils.communication.notifications.list({
        limit: filters?.limit || 50,
        offset: 0,
        type: filters?.type,
        status: filters?.status,
      });

      return result;
    },
    enabled: !!user?.id,
    refetchInterval: enableRealtime ? undefined : 30_000,
  });

  // Setup realtime subscription
  useEffect(() => {
    if (!enableRealtime || !user?.id) {
      return;
    }

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
          const newNotification = payload.new as any;

          // Transform to match expected format
          const notification: NotificationOutput = {
            ...newNotification,
            createdAt: new Date(newNotification.created_at),
            readAt: newNotification.read_at
              ? new Date(newNotification.read_at)
              : null,
            dismissedAt: newNotification.dismissed_at
              ? new Date(newNotification.dismissed_at)
              : null,
          };

          // Update query cache with new notification
          queryClient.setQueryData(
            ["notifications", "list", user.id, filters],
            (old: any) => {
              if (!old) return old;

              return {
                ...old,
                notifications: [notification, ...(old.notifications || [])],
                total: (old.total || 0) + 1,
                hasMore: old.hasMore,
              };
            }
          );

          // Show toast notification
          toast.message(notification.title, {
            description: notification.message || "",
            action: notification.actionUrl
              ? {
                  label: "View",
                  onClick: () => {
                    if (notification.actionUrl) {
                      window.location.href = notification.actionUrl;
                    }
                  },
                }
              : undefined,
          });

          // Play notification sound (optional)
          if (typeof window !== "undefined" && "Audio" in window) {
            try {
              const audio = new Audio("/notification-sound.mp3");
              audio.play().catch(() => {
                // Ignore audio play errors (user interaction required)
              });
            } catch (error) {
              console.error("Failed to play notification sound:", error);
            }
          }
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
            queryKey: ["notifications", "list", user.id, filters],
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
  }, [user?.id, enableRealtime, queryClient, filters]);

  return {
    ...query,
    isConnected,
  };
};

export const useUnreadNotificationsCount = (
  options: { enableRealtime?: boolean } = {}
) => {
  const { enableRealtime = true } = options;
  const queryClient = useQueryClient();
  const { user } = useAuthedSession();
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<any>(null);

  // Query for unread count
  const query = useQuery({
    queryKey: ["notifications", "unreadCount", user?.id],
    queryFn: async () => {
      if (!user?.id) return { count: 0 };

      const result =
        await queryUtils.communication.notifications.getUnreadCount();
      return result;
    },
    enabled: !!user?.id,
    refetchInterval: enableRealtime ? undefined : 30_000,
  });

  // Setup realtime subscription for count updates
  useEffect(() => {
    if (!enableRealtime || !user?.id) {
      return;
    }

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
  }, [user?.id, enableRealtime, queryClient]);

  return {
    ...query,
    isConnected,
  };
};

// Mutation hooks following the documented pattern
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthedSession();

  return useMutation({
    ...queryUtils.communication.notifications.markAsRead.mutationOptions({
      onSuccess: () => {
        // Invalidate related queries
        queryClient.invalidateQueries({
          queryKey: queryUtils.communication.notifications.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey:
            queryUtils.communication.notifications.getUnreadCount.queryKey(),
        });

        toast.success("Notification marked as read");
      },
      onError: (error: any) => {
        toast.error(`Failed to mark notification as read: ${error.message}`);
      },
    }),
  });
};

export const useMarkMultipleNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    ...queryUtils.communication.notifications.markMultipleAsRead.mutationOptions(
      {
        onSuccess: () => {
          // Invalidate related queries
          queryClient.invalidateQueries({
            queryKey: queryUtils.communication.notifications.list.queryKey(),
          });
          queryClient.invalidateQueries({
            queryKey:
              queryUtils.communication.notifications.getUnreadCount.queryKey(),
          });

          toast.success("Notifications marked as read");
        },
        onError: (error: any) => {
          toast.error(`Failed to mark notifications as read: ${error.message}`);
        },
      }
    ),
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    ...queryUtils.communication.notifications.markAllAsRead.mutationOptions({
      onSuccess: () => {
        // Invalidate all notification queries
        queryClient.invalidateQueries({
          queryKey: queryUtils.communication.notifications.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey:
            queryUtils.communication.notifications.getUnreadCount.queryKey(),
        });

        toast.success("All notifications marked as read");
      },
      onError: (error: any) => {
        toast.error(
          `Failed to mark all notifications as read: ${error.message}`
        );
      },
    }),
  });
};

export const useDismissNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    ...queryUtils.communication.notifications.dismiss.mutationOptions({
      onSuccess: () => {
        // Invalidate related queries
        queryClient.invalidateQueries({
          queryKey: queryUtils.communication.notifications.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey:
            queryUtils.communication.notifications.getUnreadCount.queryKey(),
        });

        toast.success("Notification dismissed");
      },
      onError: (error: any) => {
        toast.error(`Failed to dismiss notification: ${error.message}`);
      },
    }),
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    ...queryUtils.communication.notifications.delete.mutationOptions({
      onSuccess: () => {
        // Invalidate related queries
        queryClient.invalidateQueries({
          queryKey: queryUtils.communication.notifications.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey:
            queryUtils.communication.notifications.getUnreadCount.queryKey(),
        });

        toast.success("Notification deleted");
      },
      onError: (error: any) => {
        toast.error(`Failed to delete notification: ${error.message}`);
      },
    }),
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    ...queryUtils.communication.notifications.create.mutationOptions({
      onSuccess: () => {
        // Invalidate notifications list to show new notification
        queryClient.invalidateQueries({
          queryKey: queryUtils.communication.notifications.list.queryKey(),
        });

        toast.success("Notification created");
      },
      onError: (error: any) => {
        toast.error(`Failed to create notification: ${error.message}`);
      },
    }),
  });
};

export const useCreateBulkNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    ...queryUtils.communication.notifications.createBulk.mutationOptions({
      onSuccess: () => {
        // Invalidate all notification queries for affected users
        // Note: In a real app, you might want to be more specific about which users to invalidate
        queryClient.invalidateQueries({
          queryKey: queryUtils.communication.notifications.list.queryKey(),
        });

        toast.success("Bulk notifications created");
      },
      onError: (error: any) => {
        toast.error(`Failed to create bulk notifications: ${error.message}`);
      },
    }),
  });
};

export const useCreateChannelInviteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    ...queryUtils.communication.notifications.createChannelInvite.mutationOptions(
      {
        onSuccess: () => {
          // Invalidate notifications for the invited user
          queryClient.invalidateQueries({
            queryKey: queryUtils.communication.notifications.list.queryKey(),
          });

          toast.success("Channel invite notification sent");
        },
        onError: (error: any) => {
          toast.error(`Failed to send channel invite: ${error.message}`);
        },
      }
    ),
  });
};

export const useCreateSystemNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    ...queryUtils.communication.notifications.createSystem.mutationOptions({
      onSuccess: () => {
        // Invalidate notifications for all target users
        queryClient.invalidateQueries({
          queryKey: queryUtils.communication.notifications.list.queryKey(),
        });

        toast.success("System notification sent");
      },
      onError: (error: any) => {
        toast.error(`Failed to send system notification: ${error.message}`);
      },
    }),
  });
};

export const useCreateAnnouncementNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    ...queryUtils.communication.notifications.createAnnouncement.mutationOptions(
      {
        onSuccess: () => {
          // Invalidate notifications for all organization members
          queryClient.invalidateQueries({
            queryKey: queryUtils.communication.notifications.list.queryKey(),
          });

          toast.success("Announcement sent to all members");
        },
        onError: (error: any) => {
          toast.error(`Failed to send announcement: ${error.message}`);
        },
      }
    ),
  });
};

