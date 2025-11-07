import { createFileRoute, useParams } from "@tanstack/react-router";
import { ChannelHeader } from "@/components/member/communication/channels/channel-header";
import { ChannelSkeleton } from "@/components/member/communication/channels/channel-skeleton";
import { JoinRequestForm } from "@/components/member/communication/channels/join-request-form";
import { MessageComposer } from "@/components/member/communication/channels/message-composer";
import { MessageList } from "@/components/member/communication/channels/message-list";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id/"
)({
  beforeLoad: ({ context: { queryClient, queryUtils }, params }) => {
    queryClient.prefetchQuery(
      queryUtils.communication.message.getChannelMessages.queryOptions({
        input: {
          channelId: params.id,
        },
      })
    );

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
  loader: async ({ context: { orpcClient }, params }) => {
    const isMember = await orpcClient.communication.channel.isMember({
      channelId: params.id,
    });

    const channel = await orpcClient.communication.channel.get({
      channelId: params.id,
    });

    return { isMember, channelName: channel?.name ?? "Channel Name" };
  },
  pendingComponent: ChannelSkeleton,
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = useParams({
    from: "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id",
  });

  const { isMember, channelName } = Route.useLoaderData();

  return (
    <div className="flex min-h-0 flex-1 flex-col border-r">
      {isMember ? (
        <>
          <ChannelHeader />
          <div className="flex min-h-0 flex-1 flex-col">
            <MessageList className="flex-1" />
            <MessageComposer channelId={id} />
          </div>
        </>
      ) : (
        <JoinRequestForm channelId={id} channelName={channelName} />
      )}
    </div>
  );
}
