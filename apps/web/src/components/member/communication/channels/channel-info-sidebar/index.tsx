import { Hash, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useChannel, useChannelSidebar } from "@/stores/channel-store";
import { ChannelInfo } from "./channel-info";
import { JoinRequests } from "./join-requests";
import { Members } from "./members";

export const ChannelInfoSidebar = ({ channelId }: { channelId: string }) => {
  const { channel, channelMembers, onlineUsersCount } = useChannel(channelId);
  const { showChannelInfoSidebar, setShowChannelInfoSidebar } =
    useChannelSidebar();

  return (
    <Sheet
      onOpenChange={setShowChannelInfoSidebar}
      open={showChannelInfoSidebar}
    >
      <SheetContent
        className="flex h-full flex-col gap-0 border-border border-l bg-background/95 p-0 backdrop-blur-sm supports-backdrop-filter:bg-background/60 sm:max-w-md"
        side="right"
      >
        <div className="shrink-0 border-border border-b bg-muted/30 p-4">
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
        </div>

        <ScrollArea className="h-0 flex-1">
          <div className="space-y-4 p-4">
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
      </SheetContent>
    </Sheet>
  );
};
