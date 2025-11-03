import { useSuspenseQuery } from "@tanstack/react-query";
import { getAuthQueryKey } from "@/lib/auth/query-keys";
import { authClient } from "@/lib/auth-client";

export const useSession = () => {
  const { data: session } = useSuspenseQuery({
    queryKey: getAuthQueryKey.session.current(),
    queryFn: async () => {
      const { data, error } = await authClient.getSession();
      if (error !== null) {
        return null;
      }

      return data;
    },
  });

  return session;
};
