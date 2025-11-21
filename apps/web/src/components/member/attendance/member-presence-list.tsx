import {
  CheckCircle,
  Circle,
  Coffee,
  Moon,
  Phone,
  Users,
  Video,
  XCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useListOrgMembers } from "@/hooks/use-list-org-members";
import type { PresenceStatus } from "@/hooks/use-presence";
import { useOrgPresence } from "@/hooks/use-presence";

const presenceConfig: Record<
  PresenceStatus,
  {
    label: string;
    color: string;
    icon: React.ReactNode;
  }
> = {
  available: {
    label: "Available",
    color: "text-green-600",
    icon: <Circle className="h-3 w-3 fill-green-600 text-green-600" />,
  },
  away: {
    label: "Away",
    color: "text-yellow-600",
    icon: <Moon className="h-3 w-3 text-yellow-600" />,
  },
  on_break: {
    label: "On Break",
    color: "text-orange-600",
    icon: <Coffee className="h-3 w-3 text-orange-600" />,
  },
  busy: {
    label: "Busy",
    color: "text-red-600",
    icon: <XCircle className="h-3 w-3 text-red-600" />,
  },
  in_call: {
    label: "In Call",
    color: "text-blue-600",
    icon: <Phone className="h-3 w-3 text-blue-600" />,
  },
  in_meeting: {
    label: "In Meeting",
    color: "text-purple-600",
    icon: <Video className="h-3 w-3 text-purple-600" />,
  },
  offline: {
    label: "Offline",
    color: "text-gray-400",
    icon: <Circle className="h-3 w-3 text-gray-400" />,
  },
  dnd: {
    label: "Do Not Disturb",
    color: "text-red-700",
    icon: <XCircle className="h-3 w-3 fill-red-700 text-red-700" />,
  },
};

const StatusSummaryCard = ({
  label,
  count,
  icon,
  color,
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}) => (
  <div className="rounded-lg border bg-card p-4">
    <div className="flex items-center justify-between">
      <p className="font-medium text-muted-foreground text-sm">{label}</p>
      {icon}
    </div>
    <p className={`mt-2 font-bold text-3xl ${color}`}>{count}</p>
  </div>
);

interface MemberPresenceItemProps {
  userId: string;
  name: string;
  email: string;
  image?: string;
  status: PresenceStatus;
}

function MemberPresenceItem({
  name,
  email,
  image,
  status,
}: MemberPresenceItemProps) {
  const config = presenceConfig[status];
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage alt={name} src={image} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="-bottom-0.5 -right-0.5 absolute rounded-full border-2 border-background bg-background p-0.5">
          {config.icon}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <p className="truncate font-medium">{name}</p>
        <p className="truncate text-muted-foreground text-sm">{email}</p>
      </div>

      <Badge className={`capitalize ${config.color} `} variant="outline">
        {config.label.replace("_", " ")}
      </Badge>
    </div>
  );
}

export function MemberPresenceList() {
  const { members } = useListOrgMembers();
  const { data: presenceData } = useOrgPresence();

  const membersWithPresence = members?.map((member) => {
    const presence = presenceData?.presence?.[member.userId];
    const status = (presence?.status as PresenceStatus) ?? "offline";

    return {
      ...member,
      status,
    };
  });

  const groupedMembers = membersWithPresence?.reduce(
    (acc, member) => {
      const group = acc[member.status] || [];
      group.push(member);
      acc[member.status] = group;
      return acc;
    },
    {} as Record<PresenceStatus, typeof membersWithPresence>
  );

  const statusOrder: PresenceStatus[] = [
    "available",
    "busy",
    "in_call",
    "in_meeting",
    "on_break",
    "away",
    "dnd",
    "offline",
  ];

  const sortedMembers = statusOrder.flatMap(
    (status) => groupedMembers?.[status] || []
  );

  const statusCounts = membersWithPresence?.reduce(
    (acc, member) => {
      acc[member.status] = (acc[member.status] || 0) + 1;
      return acc;
    },
    {} as Record<PresenceStatus, number>
  );

  const summary = {
    available: statusCounts?.available ?? 0,
    on_break: statusCounts?.on_break ?? 0,
    in_meeting: (statusCounts?.in_call ?? 0) + (statusCounts?.in_meeting ?? 0),
    offline: statusCounts?.offline ?? 0,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Presence
        </CardTitle>
        <CardDescription>
          Real-time status of your team members.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="mb-6 grid grid-cols-2 gap-4">
          <StatusSummaryCard
            color="text-green-500"
            count={summary.available}
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
            label="Available"
          />
          <StatusSummaryCard
            color="text-orange-500"
            count={summary.on_break}
            icon={<Coffee className="h-5 w-5 text-orange-500" />}
            label="On Break"
          />
          <StatusSummaryCard
            color="text-purple-500"
            count={summary.in_meeting}
            icon={<Video className="h-5 w-5 text-purple-500" />}
            label="In Meeting"
          />
          <StatusSummaryCard
            color="text-gray-400"
            count={summary.offline}
            icon={<Circle className="h-5 w-5 text-gray-400" />}
            label="Offline"
          />
        </div>

        <div>
          <h3 className="mb-4 font-medium text-lg">Team Members</h3>
          <ScrollArea className="h-80 pr-3">
            <div className="space-y-4">
              {sortedMembers?.map((member) => (
                <MemberPresenceItem
                  email={member.user.email}
                  image={member.user.image ?? undefined}
                  key={member.userId}
                  name={member.user.name}
                  status={member.status}
                  userId={member.userId}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

export function MemberPresenceListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/5" />
        <Skeleton className="mt-2 h-4 w-4/5" />
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6 grid grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="space-y-4">
          {[...new Array(5)].map((_, i) => (
            <div className="flex items-center gap-3" key={i.toString()}>
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-6 w-1/4" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
