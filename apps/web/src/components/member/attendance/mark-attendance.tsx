import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Briefcase, CheckCircle, Clock, Coffee, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { usePresenceHeartbeat } from "@/hooks/use-presence";
import { queryUtils } from "@/utils/orpc";

const formatDateTime = (value: Date | string | null | undefined) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const calculateWorkDuration = (
  checkIn: Date | string | null | undefined,
  checkOut: Date | string | null | undefined
) => {
  if (!checkIn) return 0;
  const start = new Date(checkIn);
  const end = checkOut ? new Date(checkOut) : new Date();
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
};

const formatDuration = (minutes = 0) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  return `${hrs}h ${mins}m`;
};

const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-3 rounded-lg border bg-background p-4">
    <div className="rounded-full bg-muted p-2">{icon}</div>
    <div>
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="font-semibold text-lg">{value}</p>
    </div>
  </div>
);

export const MarkAttendance = () => {
  const { data: attendance, refetch } = useSuspenseQuery(
    queryUtils.member.attendance.getStatus.queryOptions({})
  );

  const { mutateAsync: punchIn, isPending: isPunchingIn } = useMutation(
    queryUtils.member.attendance.punchIn.mutationOptions({
      onSuccess: async () => {
        toast.success("Checked in successfully!");
        await refetch();
      },
    })
  );

  const { mutateAsync: punchOut, isPending: isPunchingOut } = useMutation(
    queryUtils.member.attendance.punchOut.mutationOptions({
      onSuccess: async () => {
        toast.success("Checked out successfully!");
        await refetch();
      },
    })
  );

  const [, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      // only rerender if checked in and not out
      if (attendance?.checkInTime && !attendance?.checkOutTime) {
        setCurrentTime(new Date());
      }
    }, 1000 * 60); // every minute

    return () => clearInterval(timer);
  }, [attendance]);

  const hasCheckedIn = !!attendance?.checkInTime;
  const hasCheckedOut = !!attendance?.checkOutTime;
  const isActionPending = isPunchingIn || isPunchingOut;

  usePresenceHeartbeat({
    enabled: hasCheckedIn && !hasCheckedOut,
    punchedIn: hasCheckedIn && !hasCheckedOut,
    onBreak: false,
  });

  // --- Views ---

  if (!hasCheckedIn) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ready to Start?</CardTitle>
          <CardDescription>Punch in to begin your workday.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="bg-green-600 hover:bg-green-700"
            disabled={isActionPending}
            onClick={() => punchIn({})}
            size="lg"
          >
            {isPunchingIn ? (
              <Spinner className="mr-2" />
            ) : (
              <Clock className="mr-2 h-5 w-5" />
            )}
            <span>Punch In</span>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (hasCheckedIn && !hasCheckedOut) {
    const totalMinutes = calculateWorkDuration(attendance.checkInTime, null);
    const breakMinutes = attendance.breakDuration ?? 0;
    const workMinutes = totalMinutes - breakMinutes;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Work Session in Progress</CardTitle>
          <CardDescription>You are currently punched in.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <StatCard
              icon={<Clock className="text-blue-500" />}
              label="Checked In"
              value={formatDateTime(attendance.checkInTime)}
            />
            <StatCard
              icon={<Briefcase className="text-green-500" />}
              label="Total Work Time"
              value={formatDuration(workMinutes)}
            />
            <StatCard
              icon={<Coffee className="text-orange-500" />}
              label="Break Time"
              value={formatDuration(breakMinutes)}
            />
          </div>
          <Button
            className="bg-red-600 hover:bg-red-700"
            disabled={isActionPending}
            onClick={() => punchOut({})}
            size="lg"
          >
            {isPunchingOut ? (
              <Spinner className="mr-2" />
            ) : (
              <LogOut className="mr-2 h-5 w-5" />
            )}
            <span>Punch Out</span>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // hasCheckedIn && hasCheckedOut
  const totalMinutes = calculateWorkDuration(
    attendance.checkInTime,
    attendance.checkOutTime
  );
  const breakMinutes = attendance.breakDuration ?? 0;
  const workMinutes = totalMinutes - breakMinutes;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Day Complete!</CardTitle>
        <CardDescription>Here's a summary of your workday.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            icon={<Clock className="text-blue-500" />}
            label="Checked In"
            value={formatDateTime(attendance.checkInTime)}
          />
          <StatCard
            icon={<LogOut className="text-red-500" />}
            label="Checked Out"
            value={formatDateTime(attendance.checkOutTime)}
          />
          <StatCard
            icon={<Briefcase className="text-green-500" />}
            label="Total Work Time"
            value={formatDuration(workMinutes)}
          />
          <StatCard
            icon={<Coffee className="text-orange-500" />}
            label="Break Time"
            value={formatDuration(breakMinutes)}
          />
        </div>
        <div className="mt-6 flex items-center gap-3 rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-950 dark:text-green-300">
          <CheckCircle className="h-6 w-6" />
          <p className="font-medium">
            You have successfully punched out for the day. Great work!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export const MarkAttendanceSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-7 w-48" />
      <Skeleton className="mt-2 h-4 w-64" />
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
      <Skeleton className="h-12 w-full" />
    </CardContent>
  </Card>
);
