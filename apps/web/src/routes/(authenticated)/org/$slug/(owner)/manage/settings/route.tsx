import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import {
  Bell,
  Building,
  CreditCard,
  Database,
  Globe,
  Palette,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(owner)/manage/settings"
)({
  component: SettingsLayout,
});

const navigationItems = [
  {
    id: "general",
    title: "General",
    icon: Building,
    href: "/org/$slug/manage/settings",
  },
  {
    id: "members",
    title: "Member Management",
    icon: Users,
    href: "/org/$slug/manage/settings/members",
  },
  {
    id: "security",
    title: "Security",
    icon: Shield,
    href: "/org/$slug/manage/settings/security",
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: Bell,
    href: "/org/$slug/manage/settings/notifications",
  },
  {
    id: "appearance",
    title: "Appearance",
    icon: Palette,
    href: "/org/$slug/manage/settings/appearance",
  },
  {
    id: "data",
    title: "Data & Storage",
    icon: Database,
    href: "/org/$slug/manage/settings/data",
  },
  {
    id: "integrations",
    title: "Integrations",
    icon: Globe,
    href: "/org/$slug/manage/settings/integrations",
  },
  {
    id: "billing",
    title: "Billing & Subscription",
    icon: CreditCard,
    href: "/org/$slug/manage/settings/billing",
  },
  {
    id: "danger-zone",
    title: "Danger Zone",
    icon: Trash2,
    href: "/org/$slug/manage/settings/danger-zone",
  },
];

function SettingsLayout() {
  const location = useLocation();

  const getActiveSection = () => {
    const pathSegments = location.pathname.split("/");
    const lastSegment = pathSegments.at(-1);

    if (lastSegment === "settings" || pathSegments.at(-2) === "settings") {
      return "general";
    }

    return lastSegment || "general";
  };

  const activeSection = getActiveSection();

  return (
    <div className="my-6 flex h-full flex-1 gap-3">
      <div className="w-80 space-y-3 border-r bg-muted/10 pr-3">
        <h1 className="font-bold text-2xl tracking-tight">Settings</h1>

        <nav>
          <div className="space-y-1.5">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <Link
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                  key={item.id}
                  params={{ slug: "acme-corp" }}
                  to={item.href}
                >
                  <Icon className="h-4 w-4" />
                  <div>{item.title}</div>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
