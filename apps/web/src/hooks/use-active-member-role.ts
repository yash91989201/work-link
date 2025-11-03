import { useSuspenseQuery } from "@tanstack/react-query";
import { getAuthQueryKey } from "@/lib/auth/query-keys";
import { authClient } from "@/lib/auth-client";

export const useActiveMemberRole = () => {
  const {
    data: { data },
  } = useSuspenseQuery({
    queryKey: getAuthQueryKey.user.activeMemberRole(),
    queryFn: () => authClient.organization.getActiveMemberRole(),
  });

  return data?.role;
};
