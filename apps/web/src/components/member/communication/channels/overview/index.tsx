import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import type { ListChannelsOutputType } from "@work-link/api/lib/types";
import {
  ArrowRight,
  Hash,
  Lock,
  MessageSquare,
  Plus,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { queryUtils } from "@/utils/orpc";
import { ChannelTips } from "./tips";

export const ChannelsOverview = () => {
  const { data: channelListData } = useSuspenseQuery(
    queryUtils.communication.channel.list.queryOptions({ input: {} })
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl space-y-8">
          <RecentChannels channels={channelListData.channels.slice(0, 6)} />

          <GettingStarted />
          <ChannelTypes />
          <ChannelFeatures />
          <ChannelTips />
        </div>
      </div>
    </div>
  );
};

const RecentChannels = ({ channels }: ListChannelsOutputType) => {
  const { slug } = useParams({ from: "/(authenticated)/org/$slug" });

  if (channels.length === 0) {
    return (
      <div>
        <h2 className="mb-4 font-semibold text-2xl">Recent Channels</h2>
        <Card>
          <CardContent className="p-6 text-center">
            <Hash className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold text-lg">No channels yet</h3>
            <p className="mb-4 text-muted-foreground">
              Create your first channel to start organizing team conversations.
            </p>
            <Button
              onClick={() => {
                const createChannelForm = document.querySelector(
                  "[data-create-channel-form]"
                );
                createChannelForm?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Create First Channel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div data-channels-list>
      <h2 className="mb-4 font-semibold text-2xl">Recent Channels</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {channels.map((channel) => (
          <ChannelCard channel={channel} key={channel.id} slug={slug} />
        ))}
      </div>
    </div>
  );
};

const ChannelCard = ({
  channel,
  slug,
}: {
  channel: ListChannelsOutputType["channels"][number];
  slug: string;
}) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate({
      to: "/org/$slug/communication/channels/$id",
      params: { slug, id: channel.id },
    });
  };

  return (
    <Card
      className="group cursor-pointer border-l-4 border-l-primary/20 transition-shadow hover:border-l-primary hover:shadow-md"
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {channel.isPrivate ? (
              <Lock className="h-5 w-5 text-orange-600" />
            ) : (
              <Hash className="h-5 w-5 text-green-600" />
            )}
            <CardTitle className="truncate text-lg">{channel.name}</CardTitle>
          </div>
          {channel.isPrivate && (
            <Badge className="text-xs" variant="secondary">
              Private
            </Badge>
          )}
        </div>
        {channel.description && (
          <CardDescription className="line-clamp-2">
            {channel.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-muted-foreground text-sm">
          <span>Created by {channel.creator.name}</span>
          <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </CardContent>
    </Card>
  );
};

const ChannelTypes = () => (
  <div>
    <h2 className="mb-4 font-semibold text-2xl">Channel Types</h2>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg">Team Channels</CardTitle>
          </div>
          <Badge className="w-fit" variant="secondary">
            Public
          </Badge>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-3">
            Open channels accessible to all team members. Perfect for general
            discussions, announcements, and company-wide conversations.
          </CardDescription>
          <div className="space-y-2 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Anyone can join
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Visible to all members
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Great for collaboration
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-lg">Private Channels</CardTitle>
          </div>
          <Badge className="w-fit" variant="secondary">
            Private
          </Badge>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-3">
            Restricted channels for sensitive discussions or specific teams.
            Requires invitation or approval to join.
          </CardDescription>
          <div className="space-y-2 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              Invite-only access
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              Hidden from non-members
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              Secure conversations
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Group Channels</CardTitle>
          </div>
          <Badge className="w-fit" variant="secondary">
            Group
          </Badge>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-3">
            Small group conversations for specific projects, departments, or
            interest-based discussions.
          </CardDescription>
          <div className="space-y-2 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              Focused discussions
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              Team collaboration
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              Project-based work
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const GettingStarted = () => {
  const steps = [
    {
      icon: <Plus className="h-5 w-5" />,
      title: "Create a Channel",
      description:
        "Start by creating a channel for your team, project, or topic.",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Add Members",
      description:
        "Invite team members to join your channels and start collaborating.",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: "Start Conversations",
      description:
        "Share messages, files, and ideas with your team in real-time.",
    },
    {
      icon: <Hash className="h-5 w-5" />,
      title: "Stay Organized",
      description:
        "Use threads, mentions, and notifications to keep conversations organized.",
    },
  ];

  return (
    <div>
      <h2 className="mb-4 font-semibold text-2xl">Getting Started</h2>
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                className="flex flex-col items-center space-y-3 text-center"
                key={index.toString()}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {step.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ChannelFeatures = () => {
  const features = [
    {
      title: "Real-time Messaging",
      description: "Instant messaging with your team members",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      title: "File Sharing",
      description: "Share documents, images, and other files",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      title: "Threaded Conversations",
      description: "Keep discussions organized with threaded replies",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      title: "Mentions & Notifications",
      description: "Get notified when someone mentions you",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      title: "Pinned Messages",
      description: "Important messages stay at the top",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      title: "Search History",
      description: "Find past conversations easily",
      icon: <MessageSquare className="h-5 w-5" />,
    },
  ];

  return (
    <div>
      <h2 className="mb-4 font-semibold text-2xl">Channel Features</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <Card key={index.toString()}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-primary">{feature.icon}</div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
