import type { ChannelWithStatsOutput } from "@server/lib/schemas/channel";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { queryClient, queryUtils } from "@/utils/orpc";

interface UseChannelsOptions {
  type?: ChannelWithStatsOutput["type"];
  teamId?: string;
  includeArchived?: boolean;
  limit?: number;
  offset?: number;
  enableRealtime?: boolean;
}

export const useChannels = (options?: UseChannelsOptions) => {
  const {
    type,
    teamId,
    includeArchived = false,
    limit = 50,
    offset = 0,
    enableRealtime = true,
  } = options || {};
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel>(null);

  // Query for channels
  const { data: result } = useSuspenseQuery(
    queryUtils.communication.channel.list.queryOptions({
      input: {
        type,
        teamId,
        includeArchived,
        limit,
        offset,
      },
    })
  );

  const channels = result.channels || [];
  const total = result.total || 0;
  const hasMore = result.hasMore;

  // Setup realtime subscription for channel updates
  useEffect(() => {
    if (!enableRealtime) {
      return;
    }

    const postgresChangesChannel = supabase
      .channel("org:channels")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "channel",
        },
        (payload) => {
          const newChannel = payload.new as unknown as ChannelWithStatsOutput;

          // Transform to match expected format
          const channel: ChannelWithStatsOutput = {
            ...newChannel,
            createdAt: new Date(newChannel.createdAt),
            updatedAt: new Date(newChannel.updatedAt),
            memberCount: 0,
            messageCount: 0,
          };

          queryClient.setQueryData(
            queryUtils.communication.channel.list.queryKey({
              input: {
                type,
                teamId,
                includeArchived,
                limit,
                offset,
              },
            }),
            (old) => {
              if (!old) return old;

              return {
                ...old,
                channels: [channel, ...(old.channels || [])],
                total: (old.total || 0) + 1,
                hasMore: old.hasMore,
              };
            }
          );

          toast.success("New channel created");
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "channels",
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: queryUtils.communication.channel.list.queryKey({
              input: {
                type,
                teamId,
                includeArchived,
                limit,
                offset,
              },
            }),
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "channels",
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: queryUtils.communication.channel.list.queryKey({
              input: {},
            }),
          });
        }
      )
      .subscribe((status) => {
        console.log(`Channels realtime connection status: ${status}`);
        setIsConnected(status === "SUBSCRIBED");
      });

    channelRef.current = postgresChangesChannel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [enableRealtime, teamId, type, offset, limit, includeArchived]);

  // Mutation hooks
  const { mutateAsync: createChannel, isPending: isCreatingChannel } =
    useMutation(
      queryUtils.communication.channel.create.mutationOptions({
        onSuccess: () => {
          if (!isConnected) {
            queryClient.invalidateQueries({
              queryKey: queryUtils.communication.channel.list.queryKey({
                input: {},
              }),
            });
          }
          toast.success("Channel created successfully");
        },
        onError: (error) => {
          toast.message("Failed to create channel", {
            description:
              error instanceof Error ? error.message : "Unknown error occurred",
          });
        },
      })
    );

  const { mutateAsync: updateChannel, isPending: isUpdatingChannel } =
    useMutation(
      queryUtils.communication.channel.update.mutationOptions({
        onSuccess: () => {
          if (!isConnected) {
            queryClient.invalidateQueries({
              queryKey: queryUtils.communication.channel.list.queryKey({
                input: {},
              }),
            });
          }
          toast.success("Channel updated");
        },
        onError: (error) => {
          toast.message("Failed to create channel", {
            description:
              error instanceof Error ? error.message : "Unknown error occurred",
          });
        },
      })
    );

  const { mutateAsync: deleteChannel, isPending: isDeletingChannel } =
    useMutation(
      queryUtils.communication.channel.delete.mutationOptions({
        onSuccess: () => {
          if (!isConnected) {
            queryClient.invalidateQueries({
              queryKey: queryUtils.communication.channel.list.queryKey({
                input: {},
              }),
            });
          }
          toast.success("Channel deleted");
        },
        onError: (error) => {
          toast.message("Failed to create channel", {
            description:
              error instanceof Error ? error.message : "Unknown error occurred",
          });
        },
      })
    );

  const { mutateAsync: joinChannel, isPending: isJoiningChannel } = useMutation(
    queryUtils.communication.channel.join.mutationOptions({
      onSuccess: () => {
        if (!isConnected) {
          queryClient.invalidateQueries({
            queryKey: queryUtils.communication.channel.list.queryKey({
              input: {},
            }),
          });
        }
        toast.success("Joined channel");
      },
      onError: (error) => {
        toast.message("Failed to create channel", {
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      },
    })
  );

  const { mutateAsync: leaveChannel, isPending: isLeavingChannel } =
    useMutation(
      queryUtils.communication.channel.leave.mutationOptions({
        onSuccess: () => {
          if (!isConnected) {
            queryClient.invalidateQueries({
              queryKey: queryUtils.communication.channel.list.queryKey({
                input: {},
              }),
            });
          }
          toast.success("Left channel");
        },
        onError: (error) => {
          toast.message("Failed to create channel", {
            description:
              error instanceof Error ? error.message : "Unknown error occurred",
          });
        },
      })
    );

  return {
    channels,
    total,
    hasMore,
    isLoading:
      isCreatingChannel ||
      isUpdatingChannel ||
      isDeletingChannel ||
      isJoiningChannel ||
      isLeavingChannel,
    isCreatingChannel,
    isUpdatingChannel,
    isDeletingChannel,
    isJoiningChannel,
    isLeavingChannel,

    error: null,
    refetch: () => {
      console.log("refetch");
    },
    isConnected,
    createChannel,
    updateChannel,
    deleteChannel,
    joinChannel,
    leaveChannel,
  };
};

export const useChannel = (channelId?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel>(null);

  // Query for channel details
  const { data: channelData } = useQuery(
    queryUtils.communication.channel.get.queryOptions({
      input: {
        channelId: channelId || "",
      },
      enabled: !!channelId,
    })
  );

  // Setup realtime subscription for channel updates
  useEffect(() => {
    if (!channelId) {
      return;
    }

    const channelName = `channels:detail:${channelId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "channels",
          filter: `id=eq.${channelId}`,
        },
        () => {
          // Invalidate query to refetch updated channel details
          queryClient.invalidateQueries({
            queryKey: ["channels", "detail", channelId],
          });
        }
      )
      .subscribe((status) => {
        console.log(
          `Channel detail realtime connection status for ${channelId}: ${status}`
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
  }, [channelId]);

  return {
    data: channelData,
    isConnected,
  };
};

export const useChannelMembers = (channelId?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel>(null);

  // Query for channel members
  const { data: membersData } = useQuery(
    queryUtils.communication.channel.getMembers.queryOptions({
      input: {
        channelId: channelId || "",
        limit: 50,
        offset: 0,
      },
      enabled: !!channelId,
    })
  );

  // Setup realtime subscription for member updates
  useEffect(() => {
    if (!channelId) {
      return;
    }

    const channelName = `channels:members:${channelId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "channel_member",
          filter: `channel_id=eq.${channelId}`,
        },
        () => {
          // Invalidate query to refetch updated members
          queryClient.invalidateQueries({
            queryKey: ["channels", "members", channelId],
          });
        }
      )
      .subscribe((status) => {
        console.log(
          `Channel members realtime connection status for ${channelId}: ${status}`
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
  }, [channelId]);

  return {
    data: membersData,
    isConnected,
  };
};
