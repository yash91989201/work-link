import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ChannelHeader } from "@/components/member/communication/channels/channel-header";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-screen gap-0 bg-background">
      <div className="flex min-h-0 flex-1 flex-col">
        <ChannelHeader />
        <Outlet />
      </div>
    </div>
  );
}
