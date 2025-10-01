import { useSuspenseQuery } from "@tanstack/react-query";
import { Hash, Search, Users } from "lucide-react";
import { AddMemberForm } from "@/components/member/communication/channels/add-member-form";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { queryUtils } from "@/utils/orpc";

export function ChannelHeader({ channelId }: { channelId: string }) {
  const { data: channel } = useSuspenseQuery(
    queryUtils.communication.channel.get.queryOptions({
      input: { channelId },
    })
  );

  return (
    <div className="flex-shrink-0 border-b bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Hash className="h-6 w-6 text-muted-foreground" />
            <h1 className="font-bold text-xl">
              {channel?.name || "Loading..."}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {channel?.type && (
              <Badge className="text-xs" variant="secondary">
                {channel.type}
              </Badge>
            )}
            {channel?.isPrivate === false && (
              <Badge className="text-xs" variant="outline">
                Private
              </Badge>
            )}
            <Badge className="text-xs" variant="outline">
              <Users className="mr-1 h-3 w-3" />
              42 members
            </Badge>
          </div>
          {channel?.description && (
            <p className="mt-2 text-muted-foreground text-sm">
              {channel.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
            <Input className="h-9 w-64 pl-8" placeholder="Search messages..." />
          </div>
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
            <Skeleton className="h-5 w-24 rounded-full" />
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
