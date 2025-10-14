import {
  IconBuildingBroadcastTower,
  IconCalendarEvent,
  IconCirclePlus,
} from "@tabler/icons-react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  {
    title: "Communication",
    url: "/org/$slug/communication/channels",
    icon: IconBuildingBroadcastTower,
  },
  {
    title: "Attendance",
    url: "/org/$slug/attendance",
    icon: IconCalendarEvent,
  },
];

export function NavMain() {
  const navigate = useNavigate();

  const { slug } = useParams({
    from: "/(authenticated)/org/$slug",
  });

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
              tooltip="Quick Create"
            >
              <IconCirclePlus />
              <span>Quick Create</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                onClick={() => {
                  navigate({
                    to: item.url,
                    params: { slug },
                  });
                }}
                tooltip={item.title}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
