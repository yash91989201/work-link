import { Link } from "@tanstack/react-router";
import { Suspense } from "react";
import { Image } from "@/components/shared/image";
import { cn } from "@/lib/utils";
import { ModeToggle } from "./mode-toggle";
import { MyOrgButton, MyOrgButtonSkeleton } from "./my-org-button";
import UserMenu from "./user-menu";

export function Header() {
  const links = [{ to: "/", label: "Home" }] as const;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2" to="/">
            <Image
              alt="Work Link logo"
              height={32}
              src="/logo.webp"
              width={32}
            />
            <h2 className="hidden font-bold text-xl sm:inline-block xl:text-2xl">
              Work Link
            </h2>
          </Link>
          <nav className="flex items-center space-x-6 font-medium text-sm">
            {links.map(({ to, label }) => (
              <Link
                activeProps={{
                  className: "text-foreground",
                }}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  "text-foreground/60"
                )}
                key={to}
                to={to}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link className="flex items-center space-x-2 md:hidden" to="/">
              <Image
                alt="Work Link logo"
                height={24}
                src="/logo.webp"
                width={24}
              />
              <span className="font-bold">Work Link</span>
            </Link>
          </div>

          <nav className="flex items-center space-x-2">
            <Suspense fallback={<MyOrgButtonSkeleton />}>
              <MyOrgButton />
            </Suspense>
            <ModeToggle />
            <UserMenu />
          </nav>
        </div>
      </div>
    </header>
  );
}
