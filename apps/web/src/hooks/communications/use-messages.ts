import type { MessageType } from "@server/lib/types";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { supabase } from "@/lib/supabase";
import { queryUtils } from "@/utils/orpc";

interface UseMessagesOptions {
  limit?: number;
  offset?: number;
  beforeMessageId?: string;
  afterMessageId?: string;
  enableRealtime?: boolean;
}

export const useMessages = (
  channelId: string,
  options?: UseMessagesOptions
) => {
  const {
    limit = 50,
    offset = 0,
    enableRealtime = true,
    afterMessageId,
    beforeMessageId,
  } = options || {};
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel>(null);

  // Query for messages
  const {
    data: { messages = [] },
    refetch: refetchGetChannelMessages,
  } = useSuspenseQuery(
    queryUtils.communication.messages.getChannelMessages.queryOptions({
      input: {
        channelId,
        limit,
        offset,
        beforeMessageId: options?.beforeMessageId,
        afterMessageId: options?.afterMessageId,
      },
    })
  );

  // Setup realtime subscription
  useEffect(() => {
    if (!(enableRealtime && channelId)) {
      return;
    }

    const channelName = `messages:${channelId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "message",
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          const newMessage = payload.new as MessageType;

          const { data: sender } = await supabase
            .from("user")
            .select("name, email, image")
            .eq("id", newMessage.senderId)
            .single();

          if (!sender) {
            return;
          }

          const messageWithSender = {
            ...newMessage,
            sender,
          };

          queryClient.setQueryData(
            queryUtils.communication.messages.getChannelMessages.queryKey({
              input: {
                channelId,
                limit,
                offset,
                beforeMessageId,
                afterMessageId,
              },
            }),
            (old) => {
              if (!old) return;

              return {
                ...old,
                messages: [...(old.messages || []), messageWithSender],
              };
            }
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "message",
          filter: `channel_id=eq.${channelId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey:
              queryUtils.communication.messages.getChannelMessages.queryKey({
                input: {
                  channelId,
                  limit,
                  offset,
                  beforeMessageId,
                  afterMessageId,
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
          table: "message",
          filter: `channel_id=eq.${channelId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey:
              queryUtils.communication.messages.getChannelMessages.queryKey({
                input: {
                  channelId,
                  limit,
                  offset,
                  beforeMessageId,
                  afterMessageId,
                },
              }),
          });
        }
      )
      .subscribe((status) => {
        console.log(
          `Messages realtime connection status for ${channelId}: ${status}`
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
  }, [
    channelId,
    enableRealtime,
    queryClient,
    offset,
    limit,
    beforeMessageId,
    afterMessageId,
  ]);

  // Mutation hooks
  const createMessage = useMutation(
    queryUtils.communication.messages.create.mutationOptions({})
  );

  const updateMessage = useMutation(
    queryUtils.communication.messages.update.mutationOptions({})
  );

  const deleteMessage = useMutation(
    queryUtils.communication.messages.delete.mutationOptions({})
  );

  const addReaction = useMutation(
    queryUtils.communication.messages.addReaction.mutationOptions({})
  );

  const removeReaction = useMutation(
    queryUtils.communication.messages.removeReaction.mutationOptions({})
  );

  return {
    messages,
    isLoading: false,
    isError: false,
    error: null,
    refetch: refetchGetChannelMessages,
    isConnected,
    createMessage,
    updateMessage,
    deleteMessage,
    addReaction,
    removeReaction,
  };
};

export const useMessage = (messageId: string) => {
  return useQuery(
    queryUtils.communication.messages.get.queryOptions({
      input: {
        messageId,
      },
    })
  );
};

export const useTypingIndicator = (channelId: string) => {
  const { user } = useAuthedSession();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const channelRef = useRef<RealtimeChannel>(null);

  useEffect(() => {
    const channelName = `typing:${channelId}`;
    const channel = supabase
      .channel(channelName)
      .on("broadcast", { event: "typing" }, (payload) => {
        const { userId, isTyping } = payload.payload as {
          userId: string;
          isTyping: boolean;
        };

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
          `Typing indicator connection status for ${channelId}: ${status}`
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
        userId: user?.id,
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
