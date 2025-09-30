import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { MoreVertical } from "lucide-react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { queryUtils } from "@/utils/orpc";

export const ChannelList = () => {
  const { data: channelListData } = useSuspenseQuery(
    queryUtils.communication.channel.list.queryOptions({ input: {} })
  );

  return (
    <ScrollArea className="flex-1">
      {channelListData.channels.map((channel) => (
        <Suspense fallback={<ChannelSkeleton />} key={channel.id}>
          <Channel {...channel} />
        </Suspense>
      ))}
    </ScrollArea>
  );
};

export const Channel = ({ name, id }: { name: string; id: string }) => {
  const { slug } = useParams({
    from: "/(authenticated)/org/$slug",
  });
  const navigate = useNavigate();
  const { data: channel } = useSuspenseQuery(
    queryUtils.communication.channel.get.queryOptions({
      input: { channelId: id },
    })
  );
  return (
    <Button
      className="h-14 w-full items-center justify-between"
      onClick={() => {
        navigate({
          to: "/org/$slug/communication/channels/$id",
          params: {
            slug,
            id,
          },
        });
      }}
      variant="ghost"
    >
      <div className="flex-row items-start justify-between gap-1">
        <p className="max-w-[20ch] truncate">{name}</p>
        <span className="text-sm">{channel?.creatorName}</span>
      </div>
      <MoreVertical className="size-4" />
    </Button>
  );
};

export const ChannelSkeleton = () => {
  return (
    <div className="mb-1.5">
      <Skeleton className="h-6 w-full" />
    </div>
  );
};
