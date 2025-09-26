import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveOrgSlug } from "@/hooks/use-active-org-slug";

export function MyOrgButton() {
  const slug = useActiveOrgSlug();

  if (!slug) {
    return null;
  }

  return (
    <Link
      className={buttonVariants({ variant: "outline" })}
      params={{ slug }}
      to="/org/$slug"
    >
      My Org
    </Link>
  );
}

export function MyOrgButtonSkeleton() {
  return <Skeleton className="h-9 w-20" />;
}
