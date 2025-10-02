import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ChannelInfoSidebar } from "@/components/member/communication/channels/channel-info-sidebar";
import { ChannelsLayout } from "@/components/member/communication/channels/layout";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ChannelsLayout>
      <Outlet />
      <ChannelInfoSidebar />
    </ChannelsLayout>
  );
}
