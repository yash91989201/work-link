import { createFileRoute, useParams } from "@tanstack/react-router";
import { Hash, Settings, Users, Pin, Search } from "lucide-react";
import { MessageComposer } from "@/components/member/communication/channels/message-composer";
import { MessageList } from "@/components/member/communication/channels/message-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useSuspenseQuery } from "@tanstack/react-query";
import { queryUtils } from "@/utils/orpc";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id"
)({
  component: RouteComponent,
});

function ChannelHeader({ channelId }: { channelId: string }) {
  const { data: channel } = useSuspenseQuery(
    queryUtils.communication.channel.get.queryOptions({
      input: { channelId },
    })
  );

  return (
    <div className="border-b bg-card px-6 py-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-muted-foreground" />
            <h1 className="font-semibold text-lg">{channel?.name || "Loading..."}</h1>
            {channel?.type && (
              <Badge variant="secondary" className="text-xs">
                {channel.type}
              </Badge>
            )}
          </div>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>42 members</span>
            </div>
            {channel?.isPrivate === false && (
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">Private</Badge>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              className="w-64 pl-8 h-9"
            />
          </div>
          <Button size="icon" variant="ghost" className="h-9 w-9">
            <Pin className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-9 w-9">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {channel?.description && (
        <p className="text-muted-foreground text-sm mt-2">
          {channel.description}
        </p>
      )}
    </div>
  );
}

function RouteComponent() {
  const { id } = useParams({
    from: "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id",
  });

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <ChannelHeader channelId={id} />
      <MessageList channelId={id} />
      <MessageComposer channelId={id} />
    </div>
  );
}
