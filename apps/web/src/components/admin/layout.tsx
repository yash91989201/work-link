import { IconDotsVertical, IconLogout } from "@tabler/icons-react";
import { Link, useParams } from "@tanstack/react-router";
import { Building2, LayoutDashboard, User, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { useIsMobile } from "@/hooks/use-mobile";

const navigation = [
  {
    name: "Dashboard",
    href: "/org/$slug/dashboard",
    icon: LayoutDashboard,
    current: true,
    badge: null,
  },
  {
    name: "Teams",
    href: "/org/$slug/dashboard/teams",
    icon: Users,
    current: false,
    badge: null,
  },
  {
    name: "Members",
    href: "/org/$slug/dashboard/members",
    icon: User,
    current: false,
  },
];

export const AdminRootLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const isMobile = useIsMobile();
  const { user } = useAuthedSession();
  const { slug } = useParams({
    from: "/(authenticated)/org/$slug",
  });

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-card transition-transform duration-200 ease-in-out lg:static lg:inset-0 lg:translate-x-0">
        <div className="flex h-full flex-col">
          {/* Logo & Brand */}
          <div className="flex h-16 items-center justify-between border-b px-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">WorkLink</span>
            </div>
          </div>

          <ScrollArea className="flex-1 px-4 py-4">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    className="flex items-center justify-between rounded-lg px-3 py-2 font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                    key={item.name}
                    onClick={() => console.log("Navigate to", item.href)}
                    params={{ slug }}
                    to={item.href}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </div>
                    {item.badge && (
                      <Badge className="text-xs" variant="secondary">
                        Badge
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>

            <Separator className="my-4" />
          </ScrollArea>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="lg" variant="outline">
                <Avatar className="h-8 w-8 rounded-lg grayscale">
                  <AvatarImage alt={user.name} src={user.image ?? undefined} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-muted-foreground text-xs">
                    {user.email}
                  </span>
                </div>
                <IconDotsVertical className="ml-auto size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <IconLogout />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:pl-0">
        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
};
