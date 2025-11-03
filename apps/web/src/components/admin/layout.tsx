import { Link, useParams } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  Building2,
  ChevronDown,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  User,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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
  const { slug } = useParams({
    from: "/(authenticated)/org/$slug",
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-card transition-transform duration-200 ease-in-out lg:static lg:inset-0 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo & Brand */}
          <div className="flex h-16 items-center justify-between border-b px-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">WorkLink</span>
            </div>
            <Button
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
              size="sm"
              variant="ghost"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Organization Info */}
          <div className="border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">ACME Corp</p>
                <p className="text-muted-foreground text-xs">Organization</p>
              </div>
              <Badge className="text-xs" variant="outline">
                Admin
              </Badge>
            </div>
          </div>

          {/* Navigation */}
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

            {/* Quick Actions */}
            <div className="space-y-2 px-3">
              <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Quick Actions
              </p>
              <Button
                className="w-full justify-start"
                size="sm"
                variant="ghost"
              >
                <Users className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
              <Button
                className="w-full justify-start"
                size="sm"
                variant="ghost"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Schedule Event
              </Button>
            </div>
          </ScrollArea>

          {/* User Menu */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <span className="font-medium text-primary-foreground text-sm">
                  A
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Admin User</p>
                <p className="text-muted-foreground text-xs">admin@acme.com</p>
              </div>
              <Button size="sm" variant="ghost">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:pl-0">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b bg-background px-6">
          <div className="flex items-center gap-4">
            <Button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              size="sm"
              variant="ghost"
            >
              <Menu className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              <Separator className="h-6" orientation="vertical" />
              <Badge className="text-xs" variant="outline">
                Teams Management
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost">
              <Search className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Bell className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Separator className="h-6" orientation="vertical" />
            <Button size="sm" variant="ghost">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
