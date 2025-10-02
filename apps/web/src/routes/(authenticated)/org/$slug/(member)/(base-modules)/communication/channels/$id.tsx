import { createFileRoute, useParams } from "@tanstack/react-router";
import { JoinRequestForm } from "@/components/member/communication/channels/join-request-form";
import { MessageComposer } from "@/components/member/communication/channels/message-composer";
import { MessageList } from "@/components/member/communication/channels/message-list";
import { PendingSkeleton } from "@/components/member/communication/channels/pending-skeleton";
import { orpcClient } from "@/utils/orpc";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id"
)({
  loader: async ({ params }) => {
    const isMember = await orpcClient.communication.channel.isMember({
      channelId: params.id,
    });

    const channel = await orpcClient.communication.channel.get({
      channelId: params.id,
    });

    return { isMember, channelName: channel?.name ?? "Channel Name" };
  },
  pendingComponent: PendingSkeleton,
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
          <MessageList channelId={id} />
          <MessageComposer channelId={id} />
        </>
      ) : (
        <JoinRequestForm channelId={id} channelName={channelName} />
      )}
    </div>
  );
}
