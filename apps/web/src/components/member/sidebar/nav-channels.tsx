import { Link, useParams } from "@tanstack/react-router";
import { CircleAlert, Hash } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserChannels } from "@/hooks/communications/use-user-channels";
import { useActiveOrgSlug } from "@/hooks/use-active-org-slug";

export function NavChannels({
  ...props
}: React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { state } = useSidebar();
  const { channels } = useUserChannels();
  const { id } = useParams({
    from: "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id",
  });

  const slug = useActiveOrgSlug();

  if (slug === null) {
    return null;
  }

  if (channels.length === 0) {
    return (
      <SidebarGroup {...props}>
        <SidebarGroupLabel>Channels</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="No channels available">
                <span>
                  {state === "collapsed" ? (
                    <CircleAlert className="size-4 text-gray-500" />
                  ) : (
                    "No Channels"
                  )}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
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
              <SidebarMenuButton
                asChild
                isActive={channel.id === id}
                tooltip={channel.name}
              >
                <Link
                  params={{ slug, id: channel.id }}
                  to="/org/$slug/communication/channels/$id"
                >
                  <Hash className="size-4.5" />
                  <span>{state === "expanded" && channel.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function NavChannelsSkeleton(
  props: React.ComponentPropsWithoutRef<typeof SidebarGroup>
) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupLabel>Channels</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {Array.from({ length: 3 }).map((_, index) => (
            <SidebarMenuItem key={index.toString()}>
              <div className="flex h-8 w-full items-center gap-2 rounded-md px-2">
                <Skeleton className="h-4 w-full" />
              </div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
