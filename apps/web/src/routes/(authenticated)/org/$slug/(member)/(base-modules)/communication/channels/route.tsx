import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ChannelsLayout } from "@/components/member/communication/channels/layout";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ChannelsLayout>
      <div className="flex h-full">
        <Outlet />
      </div>
    </ChannelsLayout>
  );
}
