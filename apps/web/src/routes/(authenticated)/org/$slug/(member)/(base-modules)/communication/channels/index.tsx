import { createFileRoute } from "@tanstack/react-router";
import { ChannelsOverview } from "@/components/member/communication/channels/overview";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <ChannelsOverview />;
}
