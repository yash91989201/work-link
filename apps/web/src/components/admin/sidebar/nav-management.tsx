import { IconBrandTeams } from "@tabler/icons-react";
import { Link, useParams } from "@tanstack/react-router";
import { User } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavManagement() {
  const { slug } = useParams({ from: "/(authenticated)/org/$slug" });

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Management</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link params={{ slug }} to="/org/$slug/dashboard/teams">
              <IconBrandTeams />
              <span>Teams</span>
            </Link>
          </SidebarMenuButton>
          <SidebarMenuButton asChild>
            <Link params={{ slug }} to="/org/$slug/dashboard/members">
              <User />
              <span>Members</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
