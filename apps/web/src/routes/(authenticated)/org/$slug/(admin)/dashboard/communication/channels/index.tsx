import { createFileRoute } from "@tanstack/react-router";
import { ChannelsListTable } from "@/components/admin/communication/channels/channels-list-table";
import { CreateChannelForm } from "@/components/admin/communication/channels/create-channel-form";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(admin)/dashboard/communication/channels/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="py-4">
        <div>
          <h1 className="mt-2 font-bold text-2xl">Channels</h1>
          <p className="text-muted-foreground">
            Manage communication channels in your organization.
          </p>
        </div>
      </div>

      <div>
        <div className="mb-4 flex justify-end">
          <CreateChannelForm />
        </div>
        <ChannelsListTable />
      </div>
    </div>
  );
}
