import type { RealtimeChannel } from "@supabase/supabase-js";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { queryClient, queryUtils } from "@/utils/orpc";
import type { ChannelWithCreatorOutputType } from "@server/lib/types";

interface UseChannelsOptions {
  type?: ChannelWithCreatorOutputType;
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
  } = options || {};
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel>(null);

  // Query for channels
  const {
    data: { channels = [] },
  } = useSuspenseQuery(
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

  useEffect(() => {
    const postgresChangesChannel = supabase
      .channel("org:channels")
      // .on(
      //   "postgres_changes",
      //   {
      //     event: "INSERT",
      //     schema: "public",
      //     table: "channel",
      //   },
      //   (payload) => {
      //     const newChannel = payload.new as unknown as ChannelWithStatsOutput;
      //
      //     // Transform to match expected format
      //     const channel: ChannelWithStatsOutput = {
      //       ...newChannel,
      //       createdAt: new Date(newChannel.createdAt),
      //       updatedAt: new Date(newChannel.updatedAt),
      //       memberCount: 0,
      //       messageCount: 0,
      //     };
      //
      //     queryClient.setQueryData(
      //       queryUtils.communication.channel.list.queryKey({
      //         input: {
      //           type,
      //           teamId,
      //           includeArchived,
      //         },
      //       }),
      //       (old) => {
      //         if (!old) return old;
      //
      //         return {
      //           ...old,
      //           channels: [channel, ...(old.channels || [])],
      //         };
      //       }
      //     );
      //
      //     toast.success("New channel created");
      //   }
      // )
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
  }, [teamId, type, includeArchived]);

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

  return {
    channels,
    isLoading: isCreatingChannel || isUpdatingChannel || isCreatingChannel,
    isUpdatingChannel,

    error: null,
    refetch: () => {
      console.log("refetch");
    },
    isConnected,
    createChannel,
    updateChannel,
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

export const useChannelMembers = (channelId: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel>(null);

  const { data: membersData } = useQuery(
    queryUtils.communication.channel.getMembers.queryOptions({
      input: {
        channelId,
        limit: 50,
        offset: 0,
      },
    })
  );

  useEffect(() => {
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
