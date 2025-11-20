import { useSuspenseQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePresenceHeartbeat } from "@/hooks/use-presence";
import { queryUtils } from "@/utils/orpc";

const formatDuration = (minutes: number) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  return `${hrs}h ${mins}m`;
};

const formatTime = (date: Date | string | null) => {
  if (!date) return "--:--";
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function WorkSessionTracker() {
  const { data: attendance } = useSuspenseQuery(
    queryUtils.member.attendance.getStatus.queryOptions({})
  );

  // Determine if we should show the component and enable presence
  const isActive = !!(
    attendance &&
    attendance.checkInTime &&
    !attendance.checkOutTime
  );

  // Always call hooks unconditionally
  usePresenceHeartbeat({
    enabled: isActive,
    punchedIn: isActive,
    onBreak: false,
  });

  if (!isActive) {
    return null;
  }

  const totalBreakTime = attendance.breakDuration ?? 0;
  const checkInTime = attendance.checkInTime;
  const checkOutTime = attendance.checkOutTime;

  // Calculate working hours
  const workingMinutes = checkInTime
    ? Math.floor((Date.now() - new Date(checkInTime).getTime()) / 60000)
    : 0;
  const netWorkingMinutes = workingMinutes - totalBreakTime;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold text-lg">
          Today's Work Summary
        </CardTitle>
        <CardDescription>
          Track your working hours and break time
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Check In Time */}
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <div className="rounded-full bg-green-500/10 p-2">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Checked In</p>
              <p className="font-semibold text-lg">
                {formatTime(checkInTime)}
              </p>
            </div>
          </div>

          {/* Check Out Time */}
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <div className="rounded-full bg-red-500/10 p-2">
              <Clock className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Checked Out</p>
              <p className="font-semibold text-lg">
                {formatTime(checkOutTime)}
              </p>
            </div>
          </div>

          {/* Working Hours */}
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <div className="rounded-full bg-blue-500/10 p-2">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Working Time</p>
              <p className="font-semibold text-lg">
                {formatDuration(netWorkingMinutes)}
              </p>
            </div>
          </div>

          {/* Break Time */}
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <div className="rounded-full bg-orange-500/10 p-2">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Break Time</p>
              <p className="font-semibold text-lg">
                {formatDuration(totalBreakTime)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
