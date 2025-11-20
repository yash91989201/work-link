import { useSuspenseQuery } from "@tanstack/react-query";
import { Clock, Coffee, LogOut, Pause } from "lucide-react";
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

const formatTime = (date: Date | string) => {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const endReasonIcons: Record<string, React.ReactNode> = {
  manual: <Pause className="h-4 w-4" />,
  break: <Coffee className="h-4 w-4" />,
  punch_out: <LogOut className="h-4 w-4" />,
  idle_timeout: <Clock className="h-4 w-4" />,
};

const endReasonLabels: Record<string, string> = {
  manual: "Paused",
  break: "Break",
  punch_out: "Punched Out",
  idle_timeout: "Idle Timeout",
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

  if (!attendance || !attendance.checkInTime) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold text-lg">Work Sessions</CardTitle>
        <CardDescription>
          Your work blocks and breaks for today
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {blocks && blocks.length > 0 ? (
            <div className="space-y-3">
              {blocks.map((block, index) => (
                <div
                  key={block.id}
                  className="flex items-start justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        Session #{blocks.length - index}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatTime(block.startedAt)}
                        {block.endedAt && ` - ${formatTime(block.endedAt)}`}
                        {!block.endedAt && " - Ongoing"}
                      </p>
                      {block.endReason && (
                        <div className="mt-1 flex items-center gap-1 text-muted-foreground text-xs">
                          {endReasonIcons[block.endReason]}
                          <span>{endReasonLabels[block.endReason]}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {formatDuration(block.durationMinutes)}
                    </p>
                    {!block.endedAt && (
                      <p className="text-green-600 text-xs">Active</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-center">
              <p className="text-muted-foreground text-sm">
                No work sessions yet. Start working to track your sessions.
              </p>
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
        <CardTitle className="font-semibold text-lg">Work Sessions</CardTitle>
        <CardDescription>
          Your work blocks and breaks for today
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
