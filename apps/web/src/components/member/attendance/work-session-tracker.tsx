import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Coffee, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { usePresenceHeartbeat } from "@/hooks/use-presence";
import { useWorkBlocks } from "@/hooks/use-work-blocks";
import { queryUtils } from "@/utils/orpc";

const formatDuration = (minutes: number) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  return `${hrs}h ${mins}m`;
};

export function WorkSessionTracker() {
  const { data: attendance, refetch } = useSuspenseQuery(
    queryUtils.member.attendance.getStatus.queryOptions({})
  );

  const { startBlock, endBlock, isLoading } = useWorkBlocks();
  const [breakStart, setBreakStart] = useState<Date | null>(null);
  const [breakDuration, setBreakDuration] = useState(0);

  const { mutateAsync: addBreakDuration } = useMutation(
    queryUtils.member.attendance.addBreakDuration.mutationOptions({
      onSuccess: async () => {
        await refetch();
      },
    })
  );

  useEffect(() => {
    if (!breakStart) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - breakStart.getTime()) / 60000);
      setBreakDuration(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [breakStart]);

  if (!attendance || !attendance.checkInTime || attendance.checkOutTime) {
    return null;
  }

  const handleStartBreak = async () => {
    try {
      await endBlock({
        attendanceId: attendance.id,
        endReason: "break",
      });
      setBreakStart(new Date());
      setBreakDuration(0);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleEndBreak = async () => {
    if (!breakStart) return;

    try {
      const minutes = Math.floor((Date.now() - breakStart.getTime()) / 60000);

      await Promise.all([
        addBreakDuration({
          attendanceId: attendance.id,
          minutes: Math.max(1, minutes),
        }),
        startBlock({
          attendanceId: attendance.id,
        }),
      ]);

      setBreakStart(null);
      setBreakDuration(0);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleToggleWork = async () => {
    if (breakStart) {
      // Currently on break, end it
      await handleEndBreak();
    } else {
      // Currently working, start break
      await handleStartBreak();
    }
  };

  const onBreak = !!breakStart;
  const totalBreakTime = (attendance.breakDuration ?? 0) + breakDuration;

  // Send presence heartbeat with break status
  usePresenceHeartbeat({
    enabled: true,
    punchedIn: true,
    onBreak,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold text-lg">Work Session</CardTitle>
        <CardDescription>
          Manage your breaks and work blocks for today
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Break Status */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-muted-foreground text-sm">Current Status</p>
              <p className="font-semibold text-lg">
                {onBreak ? (
                  <span className="text-orange-600">On Break</span>
                ) : (
                  <span className="text-green-600">Working</span>
                )}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground text-sm">Total Breaks</p>
              <p className="font-semibold text-lg">
                {formatDuration(totalBreakTime)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Current Break Timer */}
          {onBreak && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <p className="mb-2 text-muted-foreground text-sm">
                Current Break Duration
              </p>
              <p className="font-mono font-bold text-2xl text-orange-600">
                {formatDuration(breakDuration)}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleToggleWork}
              disabled={isLoading}
              variant={onBreak ? "default" : "outline"}
              className={onBreak ? "bg-green-600 hover:bg-green-700" : ""}
              size="lg"
            >
              {isLoading ? (
                <Spinner className="mr-2 h-4 w-4" />
              ) : onBreak ? (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Resume Work
                </>
              ) : (
                <>
                  <Coffee className="mr-2 h-4 w-4" />
                  Start Break
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
