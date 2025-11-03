import { useSuspenseQuery } from "@tanstack/react-query";
import { getAuthQueryKey } from "@/lib/auth/query-keys";
import { authClient } from "@/lib/auth-client";

export const useMemberRole = () => {
  const { data: role } = useSuspenseQuery({
    queryKey: getAuthQueryKey.organization.roles(),
    queryFn: async () => {
      const { data, error } =
        await authClient.organization.getActiveMemberRole();
      if (error !== null) {
        return null;
      }

      return data.role;
    },
  });

  return role;
};
