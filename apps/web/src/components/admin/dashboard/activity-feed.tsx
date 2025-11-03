import {
  Activity,
  Calendar,
  Clock,
  MoreHorizontal,
  TrendingUp,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UpcomingEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  type: "meeting" | "review" | "event" | "deadline";
  attendees: number;
  location?: string;
  status?: "scheduled" | "in-progress" | "completed" | "cancelled";
}

interface RecentActivity {
  id: string;
  type:
    | "member_joined"
    | "member_left"
    | "team_created"
    | "project_completed"
    | "milestone_reached";
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
  team?: string;
  priority?: "low" | "medium" | "high";
}

interface ActivityFeedProps {
  className?: string;
}

const mockUpcomingEvents: UpcomingEvent[] = [
  {
    id: "1",
    title: "Engineering Team Sync",
    description: "Weekly standup and project updates",
    date: new Date(Date.now() + 2 * 60 * 60 * 1000),
    type: "meeting",
    attendees: 12,
    location: "Conference Room A",
    status: "scheduled",
  },
  {
    id: "2",
    title: "Q3 Performance Review",
    description: "Quarterly team performance evaluation",
    date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    type: "review",
    attendees: 8,
    location: "Virtual",
    status: "scheduled",
  },
  {
    id: "3",
    title: "Team Building Event",
    description: "Monthly team building activity",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    type: "event",
    attendees: 25,
    location: "Office Park",
    status: "scheduled",
  },
  {
    id: "4",
    title: "Project Deadline",
    description: "Mobile app development milestone",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    type: "deadline",
    attendees: 6,
    status: "scheduled",
  },
];

const mockRecentActivity: RecentActivity[] = [
  {
    id: "1",
    type: "member_joined",
    title: "New member joined",
    description: "Sarah Johnson joined the Engineering team",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    user: "Sarah Johnson",
    team: "Engineering",
    priority: "medium",
  },
  {
    id: "2",
    type: "team_created",
    title: "New team created",
    description: "Product Marketing team was created with 5 initial members",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    team: "Product Marketing",
    priority: "high",
  },
  {
    id: "3",
    type: "project_completed",
    title: "Project milestone completed",
    description: "Design team completed the Q3 branding refresh",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    team: "Design",
    priority: "high",
  },
  {
    id: "4",
    type: "milestone_reached",
    title: "Performance milestone reached",
    description: "Engineering team achieved 95% sprint completion rate",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    team: "Engineering",
    priority: "medium",
  },
  {
    id: "5",
    type: "member_left",
    title: "Member departed",
    description: "Bob Smith left the Marketing team",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    user: "Bob Smith",
    team: "Marketing",
    priority: "low",
  },
];

export const ActivityFeed = ({ className }: ActivityFeedProps) => {
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "member_joined":
        return <Users className="h-4 w-4 text-green-600" />;
      case "member_left":
        return <Users className="h-4 w-4 text-red-600" />;
      case "team_created":
        return <Activity className="h-4 w-4 text-blue-600" />;
      case "project_completed":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "milestone_reached":
        return <TrendingUp className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "meeting":
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case "review":
        return <Activity className="h-4 w-4 text-purple-600" />;
      case "event":
        return <Users className="h-4 w-4 text-green-600" />;
      case "deadline":
        return <Clock className="h-4 w-4 text-red-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;

    const variants = {
      scheduled: "default",
      "in-progress": "secondary",
      completed: "outline",
      cancelled: "destructive",
    } as const;

    return (
      <Badge
        className="text-xs"
        variant={variants[status as keyof typeof variants]}
      >
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;

    const variants = {
      low: "secondary",
      medium: "default",
      high: "destructive",
    } as const;

    return (
      <Badge
        className="text-xs"
        variant={variants[priority as keyof typeof variants]}
      >
        {priority}
      </Badge>
    );
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    }
    if (diffInMinutes < 24 * 60) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }
    const days = Math.floor(diffInMinutes / (24 * 60));
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  return (
    <div className={`grid grid-cols-1 gap-6 lg:grid-cols-2 ${className}`}>
      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Scheduled activities and meetings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockUpcomingEvents.map((event) => (
            <div
              className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              key={event.id}
            >
              <div className="rounded-full bg-muted p-2">
                {getEventIcon(event.type)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <p className="truncate font-medium text-sm">{event.title}</p>
                  {getStatusBadge(event.status)}
                </div>
                {event.description && (
                  <p className="mb-2 text-muted-foreground text-xs">
                    {event.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-muted-foreground text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    {event.date.toLocaleDateString()} •{" "}
                    {event.date.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {event.attendees}
                  </div>
                </div>
                {event.location && (
                  <p className="mt-1 text-muted-foreground text-xs">
                    📍 {event.location}
                  </p>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem>Reschedule</DropdownMenuItem>
                  <DropdownMenuItem>Cancel</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates in your organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockRecentActivity.map((activity) => (
            <div
              className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
              key={activity.id}
            >
              <div className="rounded-full bg-muted p-2">
                {getEventTypeIcon(activity.type)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-medium text-sm">{activity.title}</p>
                  {getPriorityBadge(activity.priority)}
                </div>
                <p className="text-muted-foreground text-xs">
                  {activity.description}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-muted-foreground text-xs">
                    {formatRelativeTime(activity.timestamp)}
                  </p>
                  {activity.team && (
                    <>
                      <span className="text-muted-foreground text-xs">•</span>
                      <span className="text-muted-foreground text-xs">
                        {activity.team}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
