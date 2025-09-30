import { useSuspenseQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { queryUtils } from "@/utils/orpc";
import { ChannelList } from "./channel-list";
import { CreateChannelForm } from "./create-channel-form";

interface ChannelSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

// const renderBadgeCount = (count: number) => {
//   if (count <= 0) {
//     return null;
//   }
//   return (
//     <Badge className="h-5 px-1.5 text-xs" variant="secondary">
//       {count > 99 ? "99+" : count}
//     </Badge>
//   );
// };

// const ChannelItem = ({
//   channel,
//   slug,
//   onNavigate,
// }: {
//   channel: ChannelWithStatsOutput;
//   slug: string;
//   onJoin: () => Promise<void>;
//   onLeave: () => Promise<void>;
//   onNavigate?: () => void;
// }) => {
//   const handleNavigate = () => {
//     onNavigate?.();
//   };
//
//   return (
//     <ContextMenu>
//       <ContextMenuTrigger asChild>
//         <Link
//           activeProps={{ className: "bg-accent text-accent-foreground" }}
//           className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
//           onClick={handleNavigate}
//           params={{ slug, channelId: channel.id }}
//           to="/org/$slug/communication/channels/$channelId"
//         >
//           {channel.isPrivate ? (
//             <IconLock className="h-4 w-4 text-muted-foreground" />
//           ) : (
//             <IconHash className="h-4 w-4 text-muted-foreground" />
//           )}
//           <span className="flex-1 truncate">{channel.name}</span>
//           {renderBadgeCount(channel.unreadCount ?? 0)}
//           <div className="opacity-0 group-hover:opacity-100">
//             <IconUsers className="h-3 w-3 text-muted-foreground" />
//           </div>
//         </Link>
//       </ContextMenuTrigger>
//       <ContextMenuContent>
//         {/* {!channel.memberRole && ( */}
//         {/*   <ContextMenuItem onClick={onJoin}>Join Channel</ContextMenuItem> */}
//         {/* )} */}
//         {/* {channel.memberRole && ( */}
//         {/*   <ContextMenuItem onClick={onLeave}>Leave Channel</ContextMenuItem> */}
//         {/* )} */}
//         <ContextMenuSeparator />
//         <ContextMenuItem>
//           <IconSettings className="mr-2 h-4 w-4" />
//           Channel Settings
//         </ContextMenuItem>
//       </ContextMenuContent>
//     </ContextMenu>
//   );
// };

export const ChannelSidebar = ({ className }: ChannelSidebarProps) => {
  const { refetch: refetchChannelList, isRefetching: isRefetchingChannelList } =
    useSuspenseQuery(
      queryUtils.communication.channel.list.queryOptions({ input: {} })
    );
  // const [showPublic, setShowPublic] = useState(true);
  // const [showPrivate, setShowPrivate] = useState(true);
  // const { slug } = useParams({ strict: false });

  // const { channels, joinChannel, leaveChannel, isLoading } = useChannels();

  // const handleJoin = async (channelId: string) => {
  //   await joinChannel({ channelId });
  // };

  // const handleLeave = async (channelId: string) => {
  //   await leaveChannel({ channelId });
  // };
  //
  // const publicChannels = channels.filter((channel) => !channel.isPrivate);
  // const privateChannels = channels.filter((channel) => channel.isPrivate);

  return (
    <div className={cn("flex h-full w-64 flex-col", className)}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="font-semibold">Channels</h2>
        <div className="flex gap-3">
          <CreateChannelForm />
          <Button
            className="size-6 rounded-sm"
            disabled={isRefetchingChannelList}
            onClick={() => refetchChannelList()}
            size="icon"
            variant="outline"
          >
            <RefreshCw
              className={cn(isRefetchingChannelList && "animate-spin")}
            />
          </Button>
        </div>
      </div>

      <ChannelList />

      {/* <ScrollArea className="flex-1"> */}
      {/*   {isLoading ? ( */}
      {/*     <div className="p-4 text-muted-foreground text-sm"> */}
      {/*       Loading channels… */}
      {/*     </div> */}
      {/*   ) : ( */}
      {/*     <div className="space-y-2 p-2"> */}
      {/*       <Collapsible onOpenChange={setShowPublic} open={showPublic}> */}
      {/*         <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left font-medium text-sm hover:bg-accent"> */}
      {/*           <span>Public Channels</span> */}
      {/*           <Badge className="h-4 px-1.5 text-xs" variant="secondary"> */}
      {/*             {publicChannels.length} */}
      {/*           </Badge> */}
      {/*         </CollapsibleTrigger> */}
      {/*         <CollapsibleContent className="space-y-1 pl-2"> */}
      {/*           {publicChannels.length === 0 ? ( */}
      {/*             <p className="px-2 py-1 text-muted-foreground text-xs"> */}
      {/*               No public channels */}
      {/*             </p> */}
      {/*           ) : ( */}
      {/*             publicChannels.map((channel) => ( */}
      {/*               <ChannelItem */}
      {/*                 channel={channel} */}
      {/*                 key={channel.id} */}
      {/*                 onJoin={() => handleJoin(channel.id)} */}
      {/*                 onLeave={() => handleLeave(channel.id)} */}
      {/*                 onNavigate={onNavigate} */}
      {/*                 slug={slug ?? ""} */}
      {/*               /> */}
      {/*             )) */}
      {/*           )} */}
      {/*         </CollapsibleContent> */}
      {/*       </Collapsible> */}
      {/**/}
      {/*       <Separator /> */}
      {/**/}
      {/*       <Collapsible onOpenChange={setShowPrivate} open={showPrivate}> */}
      {/*         <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left font-medium text-sm hover:bg-accent"> */}
      {/*           <span>Private Channels</span> */}
      {/*           <Badge className="h-4 px-1.5 text-xs" variant="secondary"> */}
      {/*             {privateChannels.length} */}
      {/*           </Badge> */}
      {/*         </CollapsibleTrigger> */}
      {/*         <CollapsibleContent className="space-y-1 pl-2"> */}
      {/*           {privateChannels.length === 0 ? ( */}
      {/*             <p className="px-2 py-1 text-muted-foreground text-xs"> */}
      {/*               No private channels */}
      {/*             </p> */}
      {/*           ) : ( */}
      {/*             privateChannels.map((channel) => ( */}
      {/*               <ChannelItem */}
      {/*                 channel={channel} */}
      {/*                 key={channel.id} */}
      {/*                 onJoin={() => handleJoin(channel.id)} */}
      {/*                 onLeave={() => handleLeave(channel.id)} */}
      {/*                 onNavigate={onNavigate} */}
      {/*                 slug={slug ?? ""} */}
      {/*               /> */}
      {/*             )) */}
      {/*           )} */}
      {/*         </CollapsibleContent> */}
      {/*       </Collapsible> */}
      {/*     </div> */}
      {/*   )} */}
      {/* </ScrollArea> */}
    </div>
  );
};
