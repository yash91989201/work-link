import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Clock, LogOut } from "lucide-react";
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
import { queryUtils } from "@/utils/orpc";

const formatDateTime = (value: Date | string | null | undefined) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const calculateWorkDuration = (
  checkIn: Date | string | null | undefined,
  checkOut: Date | string | null | undefined
) => {
  if (!checkIn) return "N/A";
  const start = new Date(checkIn);
  const end = checkOut ? new Date(checkOut) : new Date();
  const diff = end.getTime() - start.getTime();
  const hrs = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hrs}h ${mins}m`;
};

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

  const [_, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000 * 60);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const hasCheckedIn = !!attendance?.checkInTime;
  const hasCheckedOut = !!attendance?.checkOutTime;
  const isActionPending = isPunchingIn || isPunchingOut;

  const formattedCheckIn = formatDateTime(attendance?.checkInTime);
  const formattedCheckOut = formatDateTime(attendance?.checkOutTime);
  const totalWorkHours = calculateWorkDuration(
    attendance?.checkInTime,
    attendance?.checkOutTime
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold text-lg">
          Today's Attendance
        </CardTitle>
        <CardDescription>Mark your attendance for the day.</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-muted-foreground text-sm">Check In</p>
              <p className="font-semibold">{formattedCheckIn}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Check Out</p>
              <p className="font-semibold">{formattedCheckOut}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Work Hours</p>
              <p className="font-semibold">{totalWorkHours}</p>
            </div>
          </div>

          <div className="flex justify-start gap-4">
            {!hasCheckedIn && (
              <Button
                className="bg-green-600 hover:bg-green-700"
                disabled={isActionPending}
                onClick={() => punchIn({})}
                size="lg"
              >
                {isPunchingIn ? (
                  <>
                    <Spinner className="mr-2" />
                    <span>Punching In…</span>
                  </>
                ) : (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Punch In
                  </>
                )}
              </Button>
            )}

            {hasCheckedIn && !hasCheckedOut && (
              <Button
                className="bg-red-600 hover:bg-red-700"
                disabled={isActionPending}
                onClick={() => punchOut({})}
                size="lg"
              >
                {isPunchingOut ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4 animate-spin" />
                    Punching Out…
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Punch Out
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const MarkAttendanceSkeleton = () => (
  <Card>
    <CardHeader>
      <CardTitle className="font-semibold text-lg">
        Today's Attendance
      </CardTitle>
      <CardDescription>Mark your attendance for the day.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-muted-foreground text-sm">Check In</p>
            <Skeleton className="mx-auto h-6 w-24" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Check Out</p>
            <Skeleton className="mx-auto h-6 w-24" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Work Hours</p>
            <Skeleton className="mx-auto h-6 w-24" />
          </div>
        </div>
        <div className="flex justify-start">
          <Skeleton className="h-12 w-44" />
        </div>
      </div>
    </CardContent>
  </Card>
);
