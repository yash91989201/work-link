import { Hash, Lock, X } from "lucide-react";
import { Activity } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useChannel, useChannelSidebar } from "@/stores/channel-store";
import { cn } from "@/lib/utils";
import { AddMemberForm } from "@/components/member/communication/channels/add-member-form";
import { ChannelInfo } from "./channel-info";
import { JoinRequests } from "./join-requests";
import { Members } from "./members";

export const ChannelInfoSidebar = ({ channelId }: { channelId: string }) => {
  const { channel, channelMembers, onlineUsersCount } = useChannel(channelId);
  const { showChannelInfoSidebar, setShowChannelInfoSidebar } =
    useChannelSidebar();

  return (
    <Activity mode={showChannelInfoSidebar ? "visible" : "hidden"}>
      <div
        className={cn(
          "flex h-full w-80 transform flex-col overflow-hidden border-border border-l bg-background/95 backdrop-blur-sm transition-transform duration-300 ease-in-out supports-backdrop-filter:bg-background/60",
          showChannelInfoSidebar ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Fixed Header */}
        <div className="shrink-0 border-border border-b bg-muted/30 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                {channel.isPrivate ? (
                  <Lock className="h-5 w-5 text-primary" />
                ) : (
                  <Hash className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-foreground text-lg">
                  {channel.name}
                </h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <Badge className="text-xs" variant="secondary">
                    {channel.type}
                  </Badge>
                  <Badge className="text-xs" variant="outline">
                    {channel.isPrivate ? "Private" : "Public"}
                  </Badge>
                  <Badge className="text-xs" variant="outline">
                    {channelMembers.length} members
                  </Badge>
                  <Badge className="text-xs" variant="outline">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="ml-1">{onlineUsersCount} online</span>
                  </Badge>
                </div>
              </div>
            </div>

            <Button
              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setShowChannelInfoSidebar(false)}
              size="icon"
              variant="ghost"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-0 flex-1">
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <AddMemberForm channelId={channelId} />
            </div>

            <Separator className="bg-border/50" />

            <Members members={channelMembers} />

            <Separator className="bg-border/50" />

            <JoinRequests channelId={channelId} />

            <Separator className="bg-border/50" />

            <ChannelInfo
              channelDescription={channel.description ?? ""}
              createdAt={channel.createdAt}
              createdByName={channel.creator.name}
            />
          </div>
        </ScrollArea>
      </div>
    </Activity>
  );
};
