import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Hash, Lock, MoreVertical } from "lucide-react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { queryUtils } from "@/utils/orpc";

export const ChannelList = () => {
  const { data: channelListData } = useSuspenseQuery(
    queryUtils.communication.channel.list.queryOptions({ input: {} })
  );

  return (
    <ScrollArea className="flex-1">
      <div className="px-3 py-2">
        <div className="mb-2 px-2">
          <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
            Team Channels
          </p>
        </div>
        {channelListData.channels.map((channel) => (
          <Suspense fallback={<ChannelSkeleton />} key={channel.id}>
            <Channel {...channel} />
          </Suspense>
        ))}
      </div>
    </ScrollArea>
  );
};

export const Channel = ({
  name,
  id,
  isPrivate,
}: {
  name: string;
  id: string;
  isPrivate?: boolean;
}) => {
  const { slug } = useParams({
    from: "/(authenticated)/org/$slug",
  });

  const navigate = useNavigate();
  const { data: channel } = useSuspenseQuery(
    queryUtils.communication.channel.get.queryOptions({
      input: { channelId: id },
    })
  );

  const isActive = window.location.pathname.includes(id);

  if (!channel) return null;

  return (
    <Button
      className={cn(
        "h-14 w-full justify-start gap-2 px-2 font-normal",
        isActive && "bg-accent text-accent-foreground"
      )}
      onClick={() => {
        navigate({
          to: "/org/$slug/communication/channels/$id",
          params: { slug, id },
        });
      }}
      variant="ghost"
    >
      <div className="flex items-center gap-2">
        {isPrivate ? (
          <Lock className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Hash className="h-4 w-4 text-muted-foreground" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-left text-sm">{name}</p>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">
              {channel.creator.name}
            </span>
          </div>
        </div>
      </div>
      <Button
        className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
        size="icon"
        variant="ghost"
      >
        <MoreVertical className="h-3 w-3" />
      </Button>
    </Button>
  );
};

export const ChannelSkeleton = () => {
  return (
    <div className="mb-1">
      <Skeleton className="h-10 w-full" />
    </div>
  );
};
