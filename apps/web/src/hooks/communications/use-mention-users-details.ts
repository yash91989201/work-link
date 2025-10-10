import { useQuery } from "@tanstack/react-query";
import type { Mention } from "@/lib/mentions";
import { supabase } from "@/lib/supabase";

export const useMentionUsersDetails = (mentionIds: string[] | null) => {
  return useQuery({
    queryKey: ["mention-users", mentionIds],
    queryFn: async () => {
      if (!mentionIds || mentionIds.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from("user")
        .select("id, name, email, image")
        .in("id", mentionIds);

      if (error) throw error;

      return data as Mention[];
    },
    enabled: mentionIds !== null && mentionIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
