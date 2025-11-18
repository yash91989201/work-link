import { IconBroadcast } from "@tabler/icons-react";
import { Link, useParams } from "@tanstack/react-router";
import { ChevronRight, Hash } from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useUserChannels } from "@/hooks/communications/use-user-channels";
import { cn } from "@/lib/utils";

export function NavCommunication() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Communication</SidebarGroupLabel>
      <SidebarGroupContent>
        <NavChannels />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function NavChannels() {
  const { state, isMobile } = useSidebar();
  const { channels } = useUserChannels();

  const { slug } = useParams({
    from: "/(authenticated)/org/$slug",
  });

  const params = useParams({
    from: "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id",
    shouldThrow: false,
  });

  const [open, setOpen] = useState(false);

  const isPopover = state === "collapsed" && !isMobile;

  if (channels.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="No Channels">
            No Channels
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (isPopover) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <Collapsible>
            <HoverCard
              closeDelay={100}
              onOpenChange={setOpen}
              open={open}
              openDelay={50}
            >
              <HoverCardTrigger asChild>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    aria-expanded="false"
                    aria-haspopup="true"
                    aria-label="Channels"
                  >
                    <IconBroadcast aria-hidden="true" />
                    <span className="sr-only text-balance text-sm">
                      Channels
                    </span>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </HoverCardTrigger>
              <HoverCardContent
                align="start"
                aria-label="Channels list"
                className="w-fit min-w-52 p-0"
                role="menu"
                side="right"
                sideOffset={14}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 border-b p-3">
                    <span className="text-balance text-sm">Channels</span>
                  </div>
                  <SidebarMenuSub
                    className={cn(
                      isPopover && "mx-0 border-none p-1.5",
                      !isPopover && "border-gray-700"
                    )}
                    role="menu"
                  >
                    {channels.map((channel) => (
                      <SidebarMenuSubItem key={channel.id}>
                        <SidebarMenuSubButton
                          asChild
                          className="[&>svg]:size-3"
                          isActive={channel.id === params?.id}
                        >
                          <Link
                            onClick={() => setOpen(false)}
                            params={{ slug, id: channel.id }}
                            to="/org/$slug/communication/channels/$id"
                          >
                            <Hash />
                            <span>{channel.name}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </div>
              </HoverCardContent>
            </HoverCard>
          </Collapsible>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Expanded Sidebar
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              aria-expanded="false"
              aria-haspopup={channels.length ? "true" : undefined}
              aria-label="Channels"
            >
              <IconBroadcast aria-hidden="true" />
              <span>Channels</span>
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleTrigger asChild>
            <SidebarMenuAction
              aria-label="Toggle Channels submenu"
              className="cursor-pointer hover:bg-transparent data-[state=open]:rotate-90"
            >
              <ChevronRight aria-hidden="true" />
              <span className="sr-only">Toggle</span>
            </SidebarMenuAction>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {channels.map((channel) => (
                <SidebarMenuSubItem key={channel.id}>
                  <SidebarMenuSubButton
                    asChild
                    className="[&>svg]:size-3"
                    isActive={channel.id === params?.id}
                  >
                    <Link
                      params={{ slug, id: channel.id }}
                      to="/org/$slug/communication/channels/$id"
                    >
                      <Hash />
                      <span>{channel.name}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
