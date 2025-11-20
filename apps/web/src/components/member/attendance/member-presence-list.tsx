import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Circle,
  Coffee,
  Moon,
  Phone,
  Users,
  Video,
  XCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useOrgPresence } from "@/hooks/use-presence";
import type { PresenceStatus } from "@/hooks/use-presence";
import { queryUtils } from "@/utils/orpc";

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

interface MemberPresenceItemProps {
  userId: string;
  name: string;
  email: string;
  image?: string;
  status: PresenceStatus;
}

function MemberPresenceItem({
  userId,
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
    <div className="group flex items-center gap-3 rounded-lg border p-3 transition-all hover:border-primary/50 hover:bg-accent/50">
      <div className="relative">
        <Avatar className="h-11 w-11 ring-2 ring-background">
          <AvatarImage src={image} alt={name} />
          <AvatarFallback className="font-semibold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background bg-background p-0.5">
          {config.icon}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <p className="truncate font-medium text-sm">{name}</p>
        <div className="flex items-center gap-2">
          <p className="truncate text-muted-foreground text-xs">{email}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <div className={`rounded-full px-2.5 py-1 text-xs font-medium ${config.color} bg-current/10`}>
          {config.label}
        </div>
      </div>
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

  // Group by status
  const groupedMembers = membersWithPresence?.reduce(
    (acc, member) => {
      const group = acc[member.status] || [];
      group.push(member);
      acc[member.status] = group;
      return acc;
    },
    {} as Record<PresenceStatus, typeof membersWithPresence>
  );

  // Sort by priority
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

  // Count by status
  const statusCounts = membersWithPresence?.reduce(
    (acc, member) => {
      acc[member.status] = (acc[member.status] || 0) + 1;
      return acc;
    },
    {} as Record<PresenceStatus, number>
  );

  return (
    <Card className="h-fit">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 font-semibold text-lg">
          <Users className="h-5 w-5 text-primary" />
          Team Presence
        </CardTitle>
        <CardDescription>
          Real-time status of all team members
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Status Summary */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
            <p className="font-bold text-2xl text-green-700">
              {statusCounts?.available ?? 0}
            </p>
            <p className="text-green-600 text-xs font-medium">Available</p>
          </div>
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-center">
            <p className="font-bold text-2xl text-orange-700">
              {statusCounts?.on_break ?? 0}
            </p>
            <p className="text-orange-600 text-xs font-medium">On Break</p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-center">
            <p className="font-bold text-2xl text-blue-700">
              {(statusCounts?.in_call ?? 0) + (statusCounts?.in_meeting ?? 0)}
            </p>
            <p className="text-blue-600 text-xs font-medium">In Meeting</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
            <p className="font-bold text-2xl text-gray-700">
              {statusCounts?.offline ?? 0}
            </p>
            <p className="text-gray-600 text-xs font-medium">Offline</p>
          </div>
        </div>

        {/* Members List */}
        <div>
          <p className="mb-3 font-medium text-sm">Team Members</p>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-2">
              {sortedMembers?.map((member) => (
                <MemberPresenceItem
                  key={member.userId}
                  userId={member.userId}
                  name={member.user.name}
                  email={member.user.email}
                  image={member.user.image ?? undefined}
                  status={member.status}
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
        <CardTitle className="flex items-center gap-2 font-semibold text-lg">
          <Users className="h-5 w-5" />
          Team Presence
        </CardTitle>
        <CardDescription>
          See who's online and their current status
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="mb-4 grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
