import { useSuspenseQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export const useActiveOrganization = () => {
  const { data: activeOrganization } = useSuspenseQuery({
    queryKey: ["active-organization"],
    queryFn: async () => {
      const { data, error } =
        await authClient.organization.getFullOrganization();

      if (error !== null) {
        return null;
      }

      return data;
    },
  });

  return activeOrganization;
};
