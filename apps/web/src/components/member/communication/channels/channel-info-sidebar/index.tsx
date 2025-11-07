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
          "flex h-full w-80 transform flex-col overflow-hidden border-border border-l bg-background transition-transform duration-300 ease-in-out",
          showChannelInfoSidebar ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Fixed Header */}
        <div className="shrink-0 border-border border-b p-4">
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

            <Button
              className="h-8 w-8"
              onClick={() => setShowChannelInfoSidebar(false)}
              size="icon"
              variant="ghost"
            >
              <X />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-0 flex-1">
          <div className="space-y-3 p-3">
            <div className="space-y-2">
              <AddMemberForm channelId={channelId} />
            </div>

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
    </Activity>
  );
};
