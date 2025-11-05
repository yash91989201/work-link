import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import { ChannelInfoSidebar } from "@/components/member/communication/channels/channel-info-sidebar";
import { MessageListSkeleton } from "@/components/member/communication/channels/message-list";
import { MessageThreadSidebar } from "@/components/member/communication/channels/message-thread-sidebar";
import { ChannelProvider } from "@/contexts/channel-context";
import { MessageListProvider } from "@/contexts/message-list-context";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return (
    <ChannelProvider channelId={id}>
      <Suspense
        fallback={
          <div className="flex min-h-0 flex-1">
            <div className="flex min-h-0 flex-1 flex-col border-r">
              <MessageListSkeleton />
              <div className="border-t px-4 py-6 text-muted-foreground text-sm">
                Preparing composer…
              </div>
            </div>
            <div className="hidden h-full w-96 border-l bg-background lg:block" />
          </div>
        }
      >
        <MessageListProvider channelId={id}>
          <div className="flex min-h-0 flex-1">
            <Outlet />
            <MessageThreadSidebar />
            <ChannelInfoSidebar />
          </div>
        </MessageListProvider>
      </Suspense>
    </ChannelProvider>
  );
}
