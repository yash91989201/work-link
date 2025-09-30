import { createFileRoute, useParams } from "@tanstack/react-router";
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
  //
  return (
    <>
      <MessageList channelId={id} />
      <MessageComposer channelId={id} />
    </>
  );
}
