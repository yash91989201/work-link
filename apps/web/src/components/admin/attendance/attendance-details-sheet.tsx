import {
  IconCalendar,
  IconClock,
  IconFileText,
  IconMapPin,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { queryUtils } from "@/utils/orpc";

interface AttendanceDetailsSheetProps {
  attendanceId: string | null;
  onClose: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "present":
      return "default";
    case "absent":
      return "destructive";
    case "late":
      return "warning";
    case "holiday":
    case "excused":
      return "secondary";
    default:
      return "outline";
  }
};

const getInitials = (name: string | null) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export function AttendanceDetailsSheet({
  attendanceId,
  onClose,
}: AttendanceDetailsSheetProps) {
  const { data: detailData } = useQuery(
    queryUtils.admin.attendance.getAttendanceDetail.queryOptions({
      input: {
        attendanceId: attendanceId ?? "",
      },
      enabled: !!attendanceId,
    })
  );

  return (
    <Sheet onOpenChange={(open) => !open && onClose()} open={!!attendanceId}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {detailData && (
          <div className="flex flex-col gap-6">
            <SheetHeader className="space-y-4">
              <SheetTitle>Attendance Details</SheetTitle>

              {/* Member Profile Header */}
              <div className="flex items-center gap-4 rounded-lg border p-4 shadow-sm">
                <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                  <AvatarImage src={detailData.user.image ?? undefined} />
                  <AvatarFallback className="text-lg">
                    {getInitials(detailData.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="font-semibold text-lg leading-none">
                    {detailData.user.name ?? "Unknown"}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {detailData.user.email}
                  </div>
                </div>
                <Badge
                  className="capitalize"
                  variant={getStatusColor(detailData.status) as any}
                >
                  {detailData.status.replace("_", " ")}
                </Badge>
              </div>
            </SheetHeader>

            <div className="space-y-6">
              {/* Date & Summary */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="flex flex-col gap-1 p-4">
                    <span className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
                      <IconCalendar className="h-3.5 w-3.5" />
                      Date
                    </span>
                    <span className="font-medium text-sm">
                      {new Date(detailData.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex flex-col gap-1 p-4">
                    <span className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
                      <IconClock className="h-3.5 w-3.5" />
                      Total Hours
                    </span>
                    <span className="font-medium text-sm">
                      {detailData.totalHours ?? "-"} hrs
                    </span>
                  </CardContent>
                </Card>
              </div>

              {/* Time Timeline */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <IconClock className="h-4 w-4 text-muted-foreground" />
                    Time Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs">
                        Check In
                      </span>
                      <div className="font-medium text-lg">
                        {detailData.checkInTime
                          ? new Date(detailData.checkInTime).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              }
                            )
                          : "-"}
                      </div>
                      {detailData.clockInMethod && (
                        <Badge
                          className="h-5 px-1.5 text-[10px]"
                          variant="outline"
                        >
                          {detailData.clockInMethod}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs">
                        Check Out
                      </span>
                      <div className="font-medium text-lg">
                        {detailData.checkOutTime
                          ? new Date(
                              detailData.checkOutTime
                            ).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                          : "-"}
                      </div>
                      {detailData.clockOutMethod && (
                        <Badge
                          className="h-5 px-1.5 text-[10px]"
                          variant="outline"
                        >
                          {detailData.clockOutMethod}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Break Duration
                    </span>
                    <span className="font-medium">
                      {detailData.breakDuration ?? 0} mins
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Work Sessions */}
              {detailData.workBlocks.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <IconFileText className="h-4 w-4 text-muted-foreground" />
                      Work Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {detailData.workBlocks.map((block, index) => (
                      <div
                        className="relative border-muted border-l-2 pl-4 last:mb-0"
                        key={block.id}
                      >
                        <div className="-left-[5px] absolute top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">
                              Session {index + 1}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {block.durationMinutes
                                ? `${Math.floor(block.durationMinutes / 60)}h ${block.durationMinutes % 60}m`
                                : "Ongoing"}
                            </span>
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {new Date(block.startedAt).toLocaleTimeString(
                              "en-US",
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                            {" - "}
                            {block.endedAt
                              ? new Date(block.endedAt).toLocaleTimeString(
                                  "en-US",
                                  { hour: "2-digit", minute: "2-digit" }
                                )
                              : "Now"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Location & Network */}
              {(detailData.location || detailData.ipAddress) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <IconMapPin className="h-4 w-4 text-muted-foreground" />
                      Location & Network
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {detailData.location && (
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground text-xs">
                          Location
                        </span>
                        <span className="text-sm">{detailData.location}</span>
                      </div>
                    )}
                    {detailData.location && detailData.ipAddress && (
                      <Separator />
                    )}
                    {detailData.ipAddress && (
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground text-xs">
                          IP Address
                        </span>
                        <span className="font-mono text-sm">
                          {detailData.ipAddress}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {(detailData.notes || detailData.adminNotes) && (
                <div className="grid gap-4">
                  {detailData.notes && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">
                          Member Notes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-sm">
                          {detailData.notes}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                  {detailData.adminNotes && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Admin Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-sm">
                          {detailData.adminNotes}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Metadata Footer */}
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3 text-muted-foreground text-xs">
                <span>
                  Entry Type:{" "}
                  {detailData.isManualEntry ? "Manual" : "Automatic"}
                </span>
                <span>ID: {detailData.id.slice(-8)}</span>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
