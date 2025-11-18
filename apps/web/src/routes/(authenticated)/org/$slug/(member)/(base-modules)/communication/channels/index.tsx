import { createFileRoute } from "@tanstack/react-router";
import {
  ChannelFeatures,
  ChannelTypes,
  GettingStarted,
  RecentChannels,
} from "@/components/member/communication/channels/overview";
import { ChannelTips } from "@/components/member/communication/channels/overview/tips";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-6xl space-y-8">
          <RecentChannels />
          <GettingStarted />
          <ChannelTypes />
          <ChannelFeatures />
          <ChannelTips />
        </div>
      </div>
    </div>
  );
}
