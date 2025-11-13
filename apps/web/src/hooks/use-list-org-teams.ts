import { useSuspenseQuery } from "@tanstack/react-query";
import { getAuthQueryKey } from "@/lib/auth/query-keys";
import { authClient } from "@/lib/auth-client";

export function useListOrgTeams() {
  const {
    data: teams,
    refetch: refetchTeams,
    isRefetching,
  } = useSuspenseQuery({
    queryKey: getAuthQueryKey.organization.members("current"),
    queryFn: async () => {
      const { data, error } = await authClient.organization.listTeams();

      if (error !== null) {
        return [];
      }

      return data;
    },
  });

  return {
    teams,
    refetchTeams,
    isRefetching,
  };
}
