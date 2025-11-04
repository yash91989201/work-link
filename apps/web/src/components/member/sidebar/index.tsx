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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { NavChannels } from "./nav-channels";
import { NavMain } from "./nav-main";
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
      <SidebarContent>
        <NavMain />
        <SidebarSeparator />
        <NavChannels />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
