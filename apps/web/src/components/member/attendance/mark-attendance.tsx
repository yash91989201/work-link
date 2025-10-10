import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle, Clock, Loader2, LogOut } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { queryUtils } from "@/utils/orpc";

const formatDateTime = (value: Date | string | null | undefined) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const calculateWorkDuration = (
  checkIn: Date | string | null | undefined,
  checkOut: Date | string | null | undefined
) => {
  if (!checkIn) return null;
  const start = new Date(checkIn);
  const end = checkOut ? new Date(checkOut) : new Date();
  const diff = end.getTime() - start.getTime();
  const hrs = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hrs}h ${mins}m`;
};

export const MarkAttendance = () => {
  const {
    data: attendance,
    isPending: isAttendanceLoading,
    refetch,
  } = useQuery(queryUtils.member.getStatus.queryOptions({}));

  const { mutateAsync: punchIn, isPending: isPunchingIn } = useMutation(
    queryUtils.member.punchIn.mutationOptions({
      onSuccess: async () => {
        toast.success("Checked in successfully!");
        await refetch();
      },
      onError: (err) => toast.error(err.message),
    })
  );

  const { mutateAsync: punchOut, isPending: isPunchingOut } = useMutation(
    queryUtils.member.punchOut.mutationOptions({
      onSuccess: async () => {
        toast.success("Checked out successfully!");
        await refetch();
      },
      onError: (err) => toast.error(err.message),
    })
  );

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
        <CardDescription>
          Mark your check-in and check-out for the day
        </CardDescription>
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="popLayout">
          {isAttendanceLoading ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col"
              exit={{ opacity: 0, y: -10 }}
              initial={{ opacity: 0, y: 10 }}
              key="loading"
              transition={{ duration: 0.25 }}
            >
              <Spinner className="size-6" />
              <p className="mt-2 text-muted-foreground text-sm">
                Fetching your attendance status…
              </p>
            </motion.div>
          ) : (
            <motion.div
              animate={{ opacity: 1 }}
              className="space-y-6"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="attendance"
              layout
              transition={{ duration: 0.3 }}
            >
              {/* Not Checked In */}
              {!hasCheckedIn && (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                  exit={{ opacity: 0, y: -20 }}
                  initial={{ opacity: 0, y: 20 }}
                  key="punchIn"
                  layout
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    className="h-12 min-w-44 bg-green-600 hover:bg-green-700"
                    disabled={isActionPending}
                    onClick={() => punchIn({})}
                    size="lg"
                  >
                    {isPunchingIn ? (
                      <>
                        <Spinner className="mr-2" />
                        <span>Marking attendance…</span>
                      </>
                    ) : (
                      <>
                        <Clock className="mr-2 h-4 w-4" />
                        Punch In
                      </>
                    )}
                  </Button>
                  <p className="text-muted-foreground text-sm">
                    Click “Punch In” to start your workday.
                  </p>
                </motion.div>
              )}

              {/* Checked In */}
              {hasCheckedIn && !hasCheckedOut && (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                  exit={{ opacity: 0, y: -10 }}
                  initial={{ opacity: 0, y: 10 }}
                  key="punchOut"
                  layout
                >
                  <div className="flex flex-col items-start gap-2">
                    <Badge
                      className="flex items-center gap-1 bg-green-100 text-green-700"
                      variant="secondary"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Checked In
                    </Badge>
                    <p className="font-medium text-green-700 text-sm">
                      {formattedCheckIn}
                    </p>
                    {totalWorkHours && (
                      <p className="text-muted-foreground text-xs">
                        Working for {totalWorkHours}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-start">
                    <Button
                      className="bg-red-600 hover:bg-red-700"
                      disabled={isActionPending}
                      onClick={() => punchOut({})}
                      size="lg"
                    >
                      {isPunchingOut ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Punching Out…
                        </>
                      ) : (
                        <>
                          <LogOut className="mr-2 h-4 w-4" />
                          Punch Out
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Checked Out Summary */}
              {hasCheckedIn && hasCheckedOut && (
                <motion.div
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                  exit={{ opacity: 0, scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  key="summary"
                  layout
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-lg border bg-green-50 p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-200">
                        <CheckCircle className="h-4 w-4 text-green-700" />
                      </div>
                      <div>
                        <p className="font-medium text-green-900">Check In</p>
                        <p className="text-green-700 text-sm">
                          {formattedCheckIn}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg border bg-blue-50 p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-200">
                        <LogOut className="h-4 w-4 text-blue-700" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">Check Out</p>
                        <p className="text-blue-700 text-sm">
                          {formattedCheckOut}
                        </p>
                      </div>
                    </div>
                  </div>

                  <motion.div
                    className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3"
                    layout
                  >
                    <CheckCircle className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Attendance complete</p>
                      <p className="text-muted-foreground text-sm">
                        Total work hours: {totalWorkHours}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
