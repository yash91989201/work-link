import { useParams } from "@tanstack/react-router";
import {
  Archive,
  Bell,
  Hash,
  Lock,
  MoreHorizontal,
  Settings,
} from "lucide-react";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useChannelContext } from "@/contexts/channel-context";
import { Actions } from "./actions";
import { ChannelInfo } from "./channel-info";
import { JoinRequests } from "./join-requests";
import { Members } from "./members";
import { PinnedMessages, PinnedMessagesSkeleton } from "./pinned-messages";

export const ChannelInfoSidebar = () => {
  const { id: channelId } = useParams({
    from: "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id",
  });

  const { channel, channelMembers, onlineUsersCount } = useChannelContext();

  return (
    <div className="flex h-full w-96 flex-col overflow-hidden border-border border-l bg-background">
      {/* Fixed Header */}
      <div className="flex-shrink-0 border-border border-b p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              {channel.isPrivate ? (
                <Lock className="h-4 w-4 text-primary" />
              ) : (
                <Hash className="h-4 w-4 text-primary" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-foreground">
                {channel.name}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 text-muted-foreground text-xs">
                <Badge className="text-xs" variant="secondary">
                  {channel.type}
                </Badge>
                <Badge className="text-xs" variant="outline">
                  private
                </Badge>
                <Badge className="text-xs" variant="outline">
                  {channelMembers.length} members
                </Badge>
                <Badge className="text-xs" variant="outline">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                  {onlineUsersCount} online
                </Badge>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-8 w-8" size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Settings className="h-4 w-4" />
                Channel Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="h-4 w-4" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Archive className="h-4 w-4" />
                Archive Channel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ScrollArea className="h-0 flex-1">
        <div className="space-y-3 p-3">
          <Actions channelId={channelId} />

          <Separator />

          <Suspense fallback={<PinnedMessagesSkeleton />}>
            <PinnedMessages channelId={channelId} />
          </Suspense>

          <Separator />

          <Members members={channelMembers} />

          <Separator />

          <JoinRequests channelId={channelId} />

          <Separator />

          <ChannelInfo
            channelDescription={channel.description ?? ""}
            createdAt={channel.createdAt}
            createdByName={channel.creator.name}
          />
        </div>
      </ScrollArea>
    </div>
  );
};
