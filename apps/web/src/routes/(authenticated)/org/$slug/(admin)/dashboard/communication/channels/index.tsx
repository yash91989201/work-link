import { createFileRoute } from "@tanstack/react-router";
import { CreateChannelForm } from "@/components/create-channel-form";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(admin)/dashboard/communication/channels/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <CreateChannelForm />
    </div>
  );
}
