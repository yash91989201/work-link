import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Hash } from "lucide-react";
import { ChannelList } from "@/components/member/communication/channels/channel-list";
import { CreateChannelForm } from "@/components/member/communication/channels/create-channel-form";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-screen gap-0 bg-background">
      <div className="flex h-full w-80 flex-col border-r bg-card">
        <div className="flex items-center justify-between border-b px-4 py-4">
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Channels</h2>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <ChannelList />
        </div>

        <div className="border-t p-3">
          <CreateChannelForm />
        </div>
      </div>
      <div className="flex min-h-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
