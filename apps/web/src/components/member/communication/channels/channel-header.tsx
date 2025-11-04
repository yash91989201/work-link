import { Bell, Info } from "lucide-react";
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
import { useChannelContext } from "@/contexts/channel-context";

export function ChannelHeader() {
  const { showChannelInfoSidebar, setShowChannelInfoSidebar, channel } =
    useChannelContext();
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1.5" />
        <Separator
          className="mx-2 data-[orientation=vertical]:h-(--header-height)"
          orientation="vertical"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Channels</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">{channel.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-3">
          <Button size="icon" variant="ghost">
            <Bell />
          </Button>
          <ThemeToggle />
          <Button
            onClick={() => setShowChannelInfoSidebar(!showChannelInfoSidebar)}
            size="icon"
            variant="ghost"
          >
            <Info />
          </Button>
        </div>
      </div>
    </header>
  );
}
