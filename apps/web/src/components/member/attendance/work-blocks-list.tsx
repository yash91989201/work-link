import { useSuspenseQuery } from "@tanstack/react-query";
import type { WorkBlockType } from "@work-link/db/lib/types";
import { Briefcase, Clock, Coffee, LogOut, Pause } from "lucide-react";
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
import { queryUtils } from "@/utils/orpc";

const formatDuration = (minutes: number | null) => {
  if (!minutes) return "0m";
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  return `${hrs}h ${mins}m`;
};

const formatTime = (date: Date | string) =>
  new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const endReasonIcons: Record<string, React.ReactNode> = {
  manual: <Pause className="h-4 w-4 text-muted-foreground" />,
  break: <Coffee className="h-4 w-4 text-yellow-500" />,
  punch_out: <LogOut className="h-4 w-4 text-red-500" />,
  idle_timeout: <Clock className="h-4 w-4 text-gray-500" />,
};

const endReasonLabels: Record<string, string> = {
  manual: "Paused",
  break: "On Break",
  punch_out: "Punched Out",
  idle_timeout: "Idle",
};

const WorkBlockItem = ({
  block,
  sessionNumber,
  isLast,
}: {
  block: WorkBlockType;
  sessionNumber: number;
  isLast: boolean;
}) => {
  const isOngoing = !block.endedAt;
  const reason = block.endReason;

  let iconComponent: React.ReactNode;

  if (isOngoing) {
    iconComponent = reason === null
      ? <Briefcase className="h-4 w-4 text-green-500" />
      : endReasonIcons[reason as string] || <Clock className="h-4 w-4" />;
  } else {
    iconComponent = reason !== null
      ? endReasonIcons[reason as string] || <Clock className="h-4 w-4" />
      : <Clock className="h-4 w-4" />;
  }

  return (
    <div className="relative flex items-start">
      {!isLast && (
        <div className="-ml-px absolute top-4 left-4 h-full w-0.5 bg-border" />
      )}

      <div className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background ring-8 ring-card">
        {iconComponent}
      </div>

      <div className="ml-4 grow space-y-1 pb-8">
        <div className="flex items-center justify-between">
          <p className="font-semibold">
            Session #{sessionNumber}
            {isOngoing && (
              <Badge className="ml-2 animate-pulse" variant="destructive">
                Live
              </Badge>
            )}
          </p>
          <p className="font-semibold text-lg">
            {formatDuration(block.durationMinutes)}
          </p>
        </div>
        <div className="flex items-center justify-between text-muted-foreground text-sm">
          <p>
            {formatTime(block.startedAt)} -{" "}
            {isOngoing ? "Now" : formatTime(block.endedAt ?? new Date())}
          </p>
          {reason && (
            <div className="flex items-center justify-end gap-1.5">
              {endReasonLabels[reason as string]}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export function WorkBlocksList() {
  const { data: attendance } = useSuspenseQuery(
    queryUtils.member.attendance.getStatus.queryOptions({})
  );

  const { data: blocks } = useSuspenseQuery(
    queryUtils.member.workBlock.listBlocks.queryOptions({
      input: {
        attendanceId: attendance?.id ?? "",
      },
      enabled: !!attendance?.id,
    })
  );

  if (!attendance?.checkInTime) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Timeline</CardTitle>
        <CardDescription>
          A timeline of your work sessions and breaks for today.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <ScrollArea className="h-[350px] pr-4">
          {blocks && blocks.length > 0 ? (
            <div className="relative">
              {blocks.map((block, index) => (
                <WorkBlockItem
                  block={block}
                  isLast={index === blocks.length - 1}
                  key={block.id}
                  sessionNumber={blocks.length - index}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-[300px] items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Your work sessions will appear here once you start working.
                </p>
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export function WorkBlocksListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="mt-2 h-4 w-2/3" />
      </CardHeader>
      <CardContent>
        <div className="space-y-8 pt-4">
          {[...new Array(3)].map((_, i) => (
            <div className="flex items-start" key={i.toString()}>
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <div className="ml-4 w-full space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-5 w-1/4" />
                </div>
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
