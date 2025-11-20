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
    <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent">
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={image} alt={name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-white">
          {config.icon}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <p className="truncate font-medium">{name}</p>
        <p className="truncate text-muted-foreground text-sm">{email}</p>
      </div>

      <div className="text-right">
        <p className={`text-sm font-medium ${config.color}`}>{config.label}</p>
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
        {/* Status Summary */}
        <div className="mb-4 grid grid-cols-4 gap-2 text-center">
          <div className="rounded-lg border p-2">
            <p className="font-bold text-green-600 text-lg">
              {statusCounts?.available ?? 0}
            </p>
            <p className="text-muted-foreground text-xs">Available</p>
          </div>
          <div className="rounded-lg border p-2">
            <p className="font-bold text-orange-600 text-lg">
              {statusCounts?.on_break ?? 0}
            </p>
            <p className="text-muted-foreground text-xs">On Break</p>
          </div>
          <div className="rounded-lg border p-2">
            <p className="font-bold text-blue-600 text-lg">
              {(statusCounts?.in_call ?? 0) + (statusCounts?.in_meeting ?? 0)}
            </p>
            <p className="text-muted-foreground text-xs">In Meeting</p>
          </div>
          <div className="rounded-lg border p-2">
            <p className="font-bold text-gray-400 text-lg">
              {statusCounts?.offline ?? 0}
            </p>
            <p className="text-muted-foreground text-xs">Offline</p>
          </div>
        </div>

        {/* Members List */}
        <ScrollArea className="h-[400px] pr-4">
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
