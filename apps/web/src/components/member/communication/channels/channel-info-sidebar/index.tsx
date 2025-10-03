import { useParams } from "@tanstack/react-router";
import {
  Archive,
  Bell,
  Hash,
  Lock,
  MoreHorizontal,
  Settings,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Actions } from "./actions";
import { ChannelInfo } from "./channel-info";
import { JoinRequests } from "./join-requests";
import { Members } from "./members";
import { PinnedMessages } from "./pinned-messages";

const mockChannel = {
  id: "ch-123",
  name: "product-development",
  description:
    "Discussion about product features, roadmap, and development updates",
  type: "team" as const,
  isPrivate: false,
  isArchived: false,
  createdAt: new Date("2024-01-15"),
  createdBy: {
    id: "user-1",
    name: "Sarah Chen",
    email: "sarah@example.com",
    avatar: "/avatars/sarah.jpg",
  },
  memberCount: 24,
  messageCount: 1247,
  lastMessageAt: new Date("2025-01-10T10:30:00"),
  pinnedMessages: [
    {
      id: "msg-1",
      content:
        "Product launch scheduled for next Tuesday - everyone please prepare demos",
      author: "Sarah Chen",
      timestamp: new Date("2025-01-08"),
    },
    {
      id: "msg-2",
      content: "Design review documents are shared in the project folder",
      author: "Mike Johnson",
      timestamp: new Date("2025-01-05"),
    },
  ],
  members: [
    {
      id: "user-1",
      name: "Sarah Chen",
      email: "sarah@example.com",
      role: "admin",
      avatar: "/avatars/sarah.jpg",
      isOnline: true,
      lastSeen: new Date(),
    },
    {
      id: "user-2",
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "member",
      avatar: "/avatars/mike.jpg",
      isOnline: true,
      lastSeen: new Date(),
    },
    {
      id: "user-3",
      name: "Emily Davis",
      email: "emily@example.com",
      role: "moderator",
      avatar: "/avatars/emily.jpg",
      isOnline: false,
      lastSeen: new Date("2025-01-09"),
    },
    {
      id: "user-4",
      name: "Alex Kim",
      email: "alex@example.com",
      role: "member",
      avatar: null,
      isOnline: true,
      lastSeen: new Date(),
    },
    {
      id: "user-5",
      name: "Jordan Taylor",
      email: "jordan@example.com",
      role: "member",
      avatar: "/avatars/jordan.jpg",
      isOnline: false,
      lastSeen: new Date("2025-01-08"),
    },
  ],
};

export const ChannelInfoSidebar = () => {
  const { id } = useParams({
    from: "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id",
  });

  const channelId = id;
  const channel = mockChannel;

  return (
    <div className="flex h-full w-96 flex-col overflow-hidden border-border border-l bg-background">
      {/* Fixed Header */}
      <div className="flex-shrink-0 border-border border-b p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              {channel.isPrivate ? (
                <Lock className="h-4 w-4 text-primary" />
              ) : (
                <Hash className="h-4 w-4 text-primary" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-foreground">
                {channel.name}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 text-muted-foreground text-xs">
                <Badge className="text-xs" variant="secondary">
                  {channel.type}
                </Badge>
                <Badge className="text-xs" variant="outline">
                  private
                </Badge>
                <Badge className="text-xs" variant="outline">
                  {channel.memberCount} members
                </Badge>
                <Badge className="text-xs" variant="outline">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                  3 active
                </Badge>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-8 w-8" size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Settings className="h-4 w-4" />
                Channel Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="h-4 w-4" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Archive className="h-4 w-4" />
                Archive Channel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ScrollArea className="h-0 flex-1">
        <div className="space-y-3 p-3">
          <Actions channelId={channelId} />

          <Separator />

          <PinnedMessages
            onUnpin={(messageId) => {
              // TODO: wire with API
              console.log("Unpin message", messageId);
            }}
            pinnedMessages={channel.pinnedMessages}
          />

          <Separator />

          <Members members={channel.members} />

          <Separator />

          <JoinRequests />

          <Separator />

          <ChannelInfo
            channelDescription={channel.description ?? ""}
            createdAt={channel.createdAt}
            createdByName={channel.createdBy.name}
            lastMessageAt={channel.lastMessageAt}
            messageCount={channel.messageCount}
          />
        </div>
      </ScrollArea>
    </div>
  );
};
