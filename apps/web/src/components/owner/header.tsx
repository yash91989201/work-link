import { Link } from "@tanstack/react-router";
import { Building2, MailOpen, Menu, Settings, Users } from "lucide-react";
import { Suspense } from "react";
import { Image } from "@/components/shared/image";
import { ModeToggle } from "@/components/shared/mode-toggle";
import UserMenu from "@/components/shared/user-menu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useActiveOrganization } from "@/hooks/use-active-organization";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

interface OwnerHeaderProps {
  organizationName?: string;
  organizationSlug?: string;
}

export function OwnerHeader({ organizationSlug }: OwnerHeaderProps) {
  const navigationLinks = [
    {
      to: "/org/$slug/manage",
      label: "Dashboard",
    },
    {
      to: "/org/$slug/manage/settings",
      label: "Settings",
    },
  ] as const;

  const quickActions = [
    {
      label: "Invite Member",
      icon: Users,
      action: () => {
        // This will trigger the invite dialog - to be implemented
        console.log("Invite member clicked");
      },
    },
    {
      label: "Create Team",
      icon: Building2,
      action: () => {
        // This will trigger the create team dialog - to be implemented
        console.log("Create team clicked");
      },
    },
    {
      label: "View Invitations",
      icon: MailOpen,
      action: () => {
        // Navigate to invitations tab - to be implemented
        console.log("View invitations clicked");
      },
    },
  ];

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
          <nav className="flex items-center space-x-6 font-medium text-sm">
            {organizationSlug &&
              navigationLinks.map(({ to, label }) => (
                <Link
                  activeProps={{
                    className: "text-foreground",
                  }}
                  className={cn(
                    "flex items-center gap-1 transition-colors hover:text-foreground/80",
                    "text-foreground/60"
                  )}
                  key={to}
                  params={{ slug: organizationSlug }}
                  to={to}
                >
                  {label}
                </Link>
              ))}
          </nav>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost">
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {organizationSlug &&
                    navigationLinks.map(({ to, label }) => (
                      <DropdownMenuItem asChild key={to}>
                        <Link
                          className="flex w-full items-center gap-2"
                          params={{ slug: organizationSlug }}
                          to={to}
                        >
                          {label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Quick Actions
                  </DropdownMenuItem>
                  {quickActions.map(({ label, icon: Icon, action }) => (
                    <DropdownMenuItem key={label} onClick={action}>
                      <Icon className="mr-2 h-4 w-4" />
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <nav className="flex items-center space-x-2">
            <ModeToggle />

            <Suspense fallback={<Skeleton className="h-9 w-40" />}>
              <UserMenu />
            </Suspense>
          </nav>
        </div>
      </div>
    </header>
  );
}
