import { createFileRoute, useParams } from "@tanstack/react-router";
import { ChannelSkeleton } from "@/components/member/communication/channels/channel-skeleton";
import { MessageComposer } from "@/components/member/communication/channels/message-composer";
import { MaximizedMessageComposer } from "@/components/member/communication/channels/message-composer/maximized-message-composer";
import { MessageList } from "@/components/member/communication/channels/message-list";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id/"
)({
  beforeLoad: ({ context: { queryClient, queryUtils }, params }) => {
    queryClient.prefetchQuery(
      queryUtils.communication.message.searchUsers.queryOptions({
        input: {
          channelId: params.id,
          query: "",
          limit: 10,
        },
      })
    );
  },
  pendingComponent: ChannelSkeleton,
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = useParams({
    from: "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id",
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background shadow-sm">
      <div className="flex min-h-0 flex-1 flex-col">
        <MessageList key={id} />
        <div className="shrink-0 border-t bg-linear-to-b from-background to-muted/20">
          <MessageComposer channelId={id} />
        </div>
      </div>
      <MaximizedMessageComposer />
    </div>
  );
}
