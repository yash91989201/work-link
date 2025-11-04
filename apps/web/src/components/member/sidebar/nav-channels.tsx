import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Hash } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useActiveOrgSlug } from "@/hooks/use-active-org-slug";
import { queryUtils } from "@/utils/orpc";

export function NavChannels({
  ...props
}: React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { state } = useSidebar();
  const {
    data: { channels },
  } = useSuspenseQuery(queryUtils.member.channel.listChannels.queryOptions());

  const slug = useActiveOrgSlug();

  if (slug === null) {
    return null;
  }

  if (channels.length === 0) {
    return (
      <SidebarGroup {...props}>
        <SidebarGroupLabel>Channels</SidebarGroupLabel>
        <SidebarGroupContent>
          <p>No Channels</p>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }
  return (
    <SidebarGroup {...props}>
      <SidebarGroupLabel>Channels</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {channels.map((channel) => (
            <SidebarMenuItem key={channel.id}>
              <SidebarMenuButton asChild tooltip={channel.name}>
                <Link
                  params={{ slug, id: channel.id }}
                  to="/org/$slug/communication/channels/$id"
                >
                  <span>
                    {state === "collapsed" ? (
                      <Hash className="size-4.5" />
                    ) : (
                      channel.name
                    )}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
