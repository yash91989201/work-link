import { IconBrandTeams } from "@tabler/icons-react";
import { Link, useParams } from "@tanstack/react-router";
import { User } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavManagement() {
  const { slug } = useParams({ from: "/(authenticated)/org/$slug" });

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Management</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Teams Management">
              <Link params={{ slug }} to="/org/$slug/dashboard/teams">
                <IconBrandTeams />
                <span>Teams</span>
              </Link>
            </SidebarMenuButton>
            <SidebarMenuButton asChild tooltip="Members Management">
              <Link params={{ slug }} to="/org/$slug/dashboard/members">
                <User />
                <span>Members</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
