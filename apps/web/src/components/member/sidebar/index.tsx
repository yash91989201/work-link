import type * as React from "react";
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
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavAttendance } from "./nav-attendance";
import { NavCommunication } from "./nav-communication";
import { NavQuickActions } from "./nav-quick-actions";
import { NavUser } from "./nav-user";

export function MemberSidebar({
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
      <SidebarContent className="gap-0">
        <NavQuickActions />
        <NavAttendance />
        <NavCommunication />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
