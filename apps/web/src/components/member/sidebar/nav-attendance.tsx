import { IconCalendarEvent } from "@tabler/icons-react";
import { Link, useParams } from "@tanstack/react-router";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  {
    title: "Attendance",
    url: "/org/$slug/attendance",
    icon: IconCalendarEvent,
  },
];

export function NavAttendance() {
  const { slug } = useParams({
    from: "/(authenticated)/org/$slug",
  });

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Attendance</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link params={{ slug }} to={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
