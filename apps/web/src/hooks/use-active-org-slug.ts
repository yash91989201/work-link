import { useSuspenseQuery } from "@tanstack/react-query";
import { getActiveOrgSlug } from "@/lib/org";

export function useActiveOrgSlug() {
  const { data: slug } = useSuspenseQuery({
    queryKey: ["active-org-slug"],
    queryFn: getActiveOrgSlug,
  });

  return slug;
}