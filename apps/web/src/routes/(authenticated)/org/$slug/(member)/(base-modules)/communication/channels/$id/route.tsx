import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ChannelInfoSidebar } from "@/components/member/communication/channels/channel-info-sidebar";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Outlet />
      <ChannelInfoSidebar />
    </>
  );
}
