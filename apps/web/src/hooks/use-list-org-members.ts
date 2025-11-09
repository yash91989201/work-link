import { useSuspenseQuery } from "@tanstack/react-query";
import { getAuthQueryKey } from "@/lib/auth/query-keys";
import { authClient } from "@/lib/auth-client";

export function useListOrgMembers() {
  const {
    data: members,
    refetch: refetchTeamMembers,
    isRefetching,
  } = useSuspenseQuery({
    queryKey: getAuthQueryKey.organization.members("current"),
    queryFn: async () => {
      const result = await authClient.organization.listMembers();
      return result.data?.members || [];
    },
  });

  return {
    members,
    refetchTeamMembers,
    isRefetching,
  };
}
