import { IconCalendarMonth } from "@tabler/icons-react";
import { Link, useParams } from "@tanstack/react-router";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavAttendance() {
  const { slug } = useParams({ from: "/(authenticated)/org/$slug" });

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Attendance</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Overview">
              <Link
                params={{ slug }}
                search={{ page: 1 }}
                to="/org/$slug/dashboard/attendance"
              >
                <IconCalendarMonth />
                <span>Overview</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
