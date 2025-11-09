import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import { ChannelInfoSidebar } from "@/components/member/communication/channels/channel-info-sidebar";
import { MessageListSkeleton } from "@/components/member/communication/channels/message-list";
import { MessageMentionSidebar } from "@/components/member/communication/channels/message-mention-sidebar";
import { MessageThreadSidebar } from "@/components/member/communication/channels/message-thread-sidebar";
import { PinnedMessagesSidebar } from "@/components/member/communication/channels/pinned-messages-sidebar";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id"
)({
  beforeLoad: ({ context: { queryClient, queryUtils }, params }) => {
    queryClient.prefetchQuery(
      queryUtils.communication.channel.get.queryOptions({
        input: { channelId: params.id },
      })
    );

    queryClient.prefetchQuery(
      queryUtils.communication.channel.listMembers.queryOptions({
        input: {
          channelId: params.id,
        },
      })
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return (
    <div className="flex min-h-0 flex-1 bg-muted/10">
      <Suspense
        fallback={
          <div className="flex min-h-0 flex-1 bg-muted/10">
            <div className="flex min-h-0 flex-1 flex-col">
              <MessageListSkeleton />
              <div className="border-t bg-background px-4 py-6 text-center text-muted-foreground text-sm">
                Preparing message composer.
              </div>
            </div>
            <div className="hidden h-full w-96 border-l bg-background/50 backdrop-blur-sm lg:block" />
          </div>
        }
      >
        <Outlet />
      </Suspense>
      <MessageThreadSidebar channelId={id} />
      <MessageMentionSidebar channelId={id} />
      <PinnedMessagesSidebar channelId={id} />
      <ChannelInfoSidebar channelId={id} />
    </div>
  );
}
