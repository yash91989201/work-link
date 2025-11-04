import { Link } from "@tanstack/react-router";
import { Suspense } from "react";
import { Image } from "@/components/shared/image";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import UserMenu from "@/components/shared/user-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveOrganization } from "@/hooks/use-active-organization";

export function OwnerHeader() {
  const activeOrg = useActiveOrganization();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2" to="/">
            <Image
              alt="Work Link logo"
              height={32}
              src={activeOrg?.logo ?? "/logo.webp"}
              width={32}
            />
            <h2 className="hidden font-bold text-xl sm:inline-block xl:text-2xl">
              Work Link
            </h2>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="flex items-center space-x-2 md:hidden">
              <Link className="flex items-center space-x-2" to="/">
                <Image
                  alt="Work Link logo"
                  height={24}
                  src="/logo.webp"
                  width={24}
                />
                <span className="font-bold">Work Link</span>
              </Link>
            </div>
          </div>

          <nav className="flex items-center space-x-2">
            <ThemeToggle />

            <Suspense fallback={<Skeleton className="h-9 w-40" />}>
              <UserMenu />
            </Suspense>
          </nav>
        </div>
      </div>
    </header>
  );
}
