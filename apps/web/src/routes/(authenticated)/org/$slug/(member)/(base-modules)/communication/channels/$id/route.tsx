import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ChannelInfoSidebar } from "@/components/member/communication/channels/channel-info-sidebar";
import { ChannelProvider } from "@/contexts/channel-context";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return (
    <ChannelProvider channelId={id}>
      <Outlet />
      <ChannelInfoSidebar />
    </ChannelProvider>
  );
}
