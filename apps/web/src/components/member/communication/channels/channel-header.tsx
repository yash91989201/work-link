import { useSuspenseQuery } from "@tanstack/react-query";
import { Circle, Hash, Search, Users } from "lucide-react";
import { AddMemberForm } from "@/components/member/communication/channels/add-member-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChannelPresence } from "@/hooks/use-channel-presence";
import { queryUtils } from "@/utils/orpc";

export function ChannelHeader({ channelId }: { channelId: string }) {
  const { data: channel } = useSuspenseQuery(
    queryUtils.communication.channel.get.queryOptions({
      input: { channelId },
    })
  );

  const { presentUsers } = useChannelPresence(channelId);

  if (channel === null) {
    return <p>No Channel Found</p>;
  }

  return (
    <div className="flex-shrink-0 border-b bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Hash className="h-6 w-6 text-muted-foreground" />
            <h1 className="font-bold text-xl">{channel.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="text-xs" variant="secondary">
              {channel.type}
            </Badge>
            <Badge className="text-xs" variant="outline">
              {channel.isPrivate ? "Private" : "Public"}
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className="text-xs" variant="outline">
                    <Circle className="size-1.5 fill-green-500 text-green-500" />
                    {presentUsers.length}
                    <Users className="mr-1 size-3" />
                    online
                  </Badge>
                </TooltipTrigger>
                {presentUsers.length > 0 && (
                  <TooltipContent className="p-2" side="bottom">
                    <div className="space-y-2">
                      <p className="font-medium text-sm">Online now</p>
                      <div className="flex max-w-48 flex-col flex-wrap gap-2">
                        {presentUsers.map((presenceUser) => (
                          <div
                            className="flex items-center gap-1"
                            key={presenceUser.user.id}
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                alt={presenceUser.user.name}
                                src={presenceUser.user.image || undefined}
                              />
                              <AvatarFallback className="text-xs">
                                {presenceUser.user.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>{presenceUser.user.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="mt-2 text-muted-foreground text-sm">
            {channel.description}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AddMemberForm channelId={channelId} />
        </div>
      </div>
    </div>
  );
}

export function ChannelHeaderSkeleton() {
  return (
    <div className="flex-shrink-0 border-b bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Hash className="h-6 w-6 text-muted-foreground" />
            <Skeleton className="h-7 w-48" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-4 w-96" />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
            <Skeleton className="h-9 w-64 pl-8" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  );
}
