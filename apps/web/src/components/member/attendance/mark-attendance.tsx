import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { queryUtils } from "@/utils/orpc";

const formatDateTime = (value: Date | string | null | undefined) => {
  if (value == null) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const MemberMarkAttendance = () => {
  const {
    data: attendance,
    isPending: isAttendanceLoading,
    refetch: refetchAttendanceStatus,
  } = useQuery(
    queryUtils.member.attendanceStatus.queryOptions({
      staleTime: 60_000,
    })
  );

  const { mutateAsync: punchIn, isPending: isPunchingIn } = useMutation(
    queryUtils.member.punchIn.mutationOptions({
      onSuccess: async () => {
        toast.success("Attendance recorded successfully");
        await refetchAttendanceStatus();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const { mutateAsync: punchOut, isPending: isPunchingOut } = useMutation(
    queryUtils.member.punchOut.mutationOptions({
      onSuccess: async () => {
        toast.success("Punch out recorded successfully");
        await refetchAttendanceStatus();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const isActionPending = isPunchingIn || isPunchingOut;
  const isPunchedIn = attendance?.checkInTime != null;
  const isAwaitingPunchOut = isPunchedIn && attendance.checkOutTime == null;
  const hasPunchedOut = attendance?.checkOutTime != null;

  const formattedCheckIn = formatDateTime(attendance?.checkInTime ?? null);
  const formattedCheckOut = formatDateTime(attendance?.checkOutTime ?? null);

  return (
    <>
      <div className="space-y-2">
        <h1 className="font-semibold text-3xl">Attendance</h1>
        <p className="text-muted-foreground text-sm">
          Mark your attendance for today. Punch out once you are done for the
          day.
        </p>
      </div>
      {isPunchedIn ? null : (
        <Button
          className="min-w-40"
          disabled={isAttendanceLoading || isActionPending}
          onClick={() => {
            void punchIn({});
          }}
          type="button"
        >
          {isPunchingIn ? (
            <span className="flex items-center gap-2">
              <Loader className="h-4 w-4 animate-spin" focusable="false">
                <title>Processing punch in</title>
              </Loader>
              <span>Marking attendance…</span>
            </span>
          ) : (
            <span>Punch In</span>
          )}
        </Button>
      )}
      {isAwaitingPunchOut ? (
        <Button
          className="min-w-40"
          disabled={isActionPending}
          onClick={() => {
            void punchOut({});
          }}
          type="button"
          variant="secondary"
        >
          {isPunchingOut ? (
            <span className="flex items-center gap-2">
              <Loader className="h-4 w-4 animate-spin" focusable="false">
                <title>Processing punch out</title>
              </Loader>
              <span>Recording punch out…</span>
            </span>
          ) : (
            <span>Punch Out</span>
          )}
        </Button>
      ) : null}
      {isAttendanceLoading ? (
        <p className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
          <Loader className="h-4 w-4 animate-spin" focusable="false">
            <title>Loading attendance state</title>
          </Loader>
          <span>Loading today&rsquo;s attendance…</span>
        </p>
      ) : null}
      {formattedCheckIn ? (
        <p className="text-muted-foreground text-sm">
          Punched in at <span className="font-medium">{formattedCheckIn}</span>.
        </p>
      ) : null}
      {formattedCheckOut ? (
        <p className="text-muted-foreground text-sm">
          Punched out at{" "}
          <span className="font-medium">{formattedCheckOut}</span>.
        </p>
      ) : null}
      {hasPunchedOut ? (
        <p className="text-muted-foreground text-sm">
          You have completed today&rsquo;s attendance.
        </p>
      ) : null}
    </>
  );
};
