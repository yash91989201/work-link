import { IconDashboard } from "@tabler/icons-react";
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
import { NavAttendance } from "./nav-attendance";
import { NavCommunication } from "./nav-communication";
import { NavMain } from "./nav-main";
import { NavManagement } from "./nav-management";
import { NavUser } from "./nav-user";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/org/$slug/dashboard",
      icon: IconDashboard,
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
        <NavManagement />
        <NavAttendance />
        <NavCommunication />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
