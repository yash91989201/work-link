import { IconChartBar, IconDashboard, IconUsers } from "@tabler/icons-react";
import { Suspense } from "react";
import {
  OrgMenuButton,
  OrgMenuButtonSkeleton,
} from "@/components/shared/org-menu-button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/org/$slug/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Teams",
      url: "/org/$slug/dashboard/teams",
      icon: IconUsers,
    },
    {
      title: "Members",
      url: "/org/$slug/dashboard/members",
      icon: IconChartBar,
    },
  ],
};

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <Suspense fallback={<OrgMenuButtonSkeleton />}>
            <OrgMenuButton />
          </Suspense>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
