import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { Bell, Info, Pin } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChannelInfoSidebar } from "@/stores/channel-store";
import { useMessageListActions } from "@/stores/message-list-store";
import { queryUtils } from "@/utils/orpc";

export function ChannelHeader() {
  const { slug, id: channelId } = useParams({
    from: "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id",
  });

  const { data: channel } = useSuspenseQuery(
    queryUtils.communication.channel.get.queryOptions({ input: { channelId } })
  );

  const { toggleInfoSidebar } = useChannelInfoSidebar();

  const { openPinnedMessages } = useMessageListActions();

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) supports-backdrop-filter:bg-background/60">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1.5" title="Toggle Sidebar (Crtl+B)" />
        <Separator
          className="mx-2 data-[orientation=vertical]:h-(--header-height)"
          orientation="vertical"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="font-medium">
                <Link params={{ slug }} to="/org/$slug/communication/channels">
                  Channels
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                className="font-semibold text-foreground"
                href="#"
              >
                <Link
                  params={{ slug, id: channelId }}
                  to="/org/$slug/communication/channels/$id"
                >
                  {channel.name}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="h-9 w-9"
                onClick={openPinnedMessages}
                size="icon"
                variant="ghost"
              >
                <Pin className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View Pinned Messages</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="h-9 w-9" size="icon" variant="ghost">
                <Bell className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>
          <ThemeToggle />
          <Separator className="mx-1 h-6" orientation="vertical" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="h-9 w-9"
                onClick={toggleInfoSidebar}
                size="icon"
                variant="ghost"
              >
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Channel Info</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
