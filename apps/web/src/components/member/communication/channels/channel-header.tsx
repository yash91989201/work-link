import { Link, useParams } from "@tanstack/react-router";
import { AtSign, Bell, Info, Pin } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChannelMentions } from "@/hooks/communications/use-channel-mentions";
import {
  useChannelInfoSidebar,
  useMentionsSidebar,
  usePinnedMessagesSidebar,
} from "@/stores/channel-store";

export function ChannelHeader() {
  const { slug } = useParams({
    from: "/(authenticated)/org/$slug",
  });
  const channelParams = useParams({
    from: "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id",
    shouldThrow: false,
  });
  const channelId = channelParams?.id;

  const { toggleInfoSidebar } = useChannelInfoSidebar();
  const { isOpen, togglePinnedMessages } = usePinnedMessagesSidebar();
  const { isOpen: mentionsOpen, toggleMentionsSidebar } = useMentionsSidebar();
  const { mentionCount } = useChannelMentions();

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
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="relative"
                disabled={!channelId}
                onClick={toggleMentionsSidebar}
                size="icon-sm"
                variant={mentionsOpen ? "secondary" : "ghost"}
              >
                <AtSign />
                {mentionCount > 0 && (
                  <span className="-right-1 -top-1 pointer-events-none absolute inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 font-semibold text-[10px] text-destructive-foreground leading-none">
                    {mentionCount > 99 ? "99+" : mentionCount}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Mentions</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={togglePinnedMessages}
                size="icon-sm"
                variant={isOpen ? "secondary" : "ghost"}
              >
                <Pin />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isOpen ? "Close pinned messages" : "View pinned messages"}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon-sm" variant="ghost">
                <Bell />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>
          <ThemeToggle />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={toggleInfoSidebar}
                size="icon-sm"
                variant="ghost"
              >
                <Info />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Channel Info</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
