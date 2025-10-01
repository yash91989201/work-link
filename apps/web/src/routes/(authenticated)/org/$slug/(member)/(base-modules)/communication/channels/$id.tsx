import { createFileRoute, useParams } from "@tanstack/react-router";
import { Suspense } from "react";
import {
  ChannelHeader,
  ChannelHeaderSkeleton,
} from "@/components/member/communication/channels/channel-header";
import { MessageComposer } from "@/components/member/communication/channels/message-composer";
import { MessageList } from "@/components/member/communication/channels/message-list";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = useParams({
    from: "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id",
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Suspense fallback={<ChannelHeaderSkeleton />}>
        <ChannelHeader channelId={id} />
      </Suspense>
      <MessageList channelId={id} />
      <MessageComposer channelId={id} />
    </div>
  );
}
