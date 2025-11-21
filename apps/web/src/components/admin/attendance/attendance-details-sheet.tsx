import {
  IconBriefcase,
  IconCalendar,
  IconClock,
  IconFileDescription,
  IconMapPin,
  IconNetwork,
  IconUserCircle,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { queryUtils } from "@/utils/orpc";

// Props for the main component
interface AttendanceDetailsSheetProps {
  attendanceId: string | null;
  onClose: () => void;
}

// Helper to determine badge color based on attendance status
const getStatusColor = (status: string) => {
  switch (status) {
    case "present":
      return "default";
    case "absent":
      return "destructive";
    case "late":
      return "destructive";
    case "holiday":
    case "excused":
      return "secondary";
    default:
      return "outline";
  }
};

// Helper to get initials from a name string
const getInitials = (name: string | null) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Reusable component for displaying a detail item with an icon and label
function DetailItem({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
      <div className="flex flex-col gap-1">
        <span className="font-medium text-sm">{label}</span>
        <div className="text-muted-foreground text-sm">{children}</div>
      </div>
    </div>
  );
}

// The main sheet component
export function AttendanceDetailsSheet({
  attendanceId,
  onClose,
}: AttendanceDetailsSheetProps) {
  const { data: detailData, isLoading } = useQuery(
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
        <SheetHeader>
          <SheetTitle>Attendance Details</SheetTitle>
        </SheetHeader>

        {isLoading && <div className="py-8 text-center">Loading...</div>}

        {detailData && (
          <div className="space-y-8 p-6">
            {/* User Profile Section */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={detailData.user.image ?? undefined} />
                <AvatarFallback className="text-xl">
                  {getInitials(detailData.user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-bold text-xl">
                  {detailData.user.name ?? "Unknown"}
                </p>
                <p className="text-muted-foreground">{detailData.user.email}</p>
              </div>
              <Badge
                className="capitalize"
                variant={getStatusColor(detailData.status)}
              >
                {detailData.status.replace("_", " ")}
              </Badge>
            </div>

            <Separator />

            {/* Core Details Section */}
            <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <DetailItem icon={IconCalendar} label="Date">
                {new Date(detailData.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </DetailItem>
              <DetailItem icon={IconClock} label="Total Hours">
                <span className="font-semibold text-foreground">
                  {detailData.totalHours ?? "N/A"} hrs
                </span>
              </DetailItem>
              <DetailItem icon={IconUserCircle} label="Clock-In Method">
                <Badge variant="outline">
                  {detailData.clockInMethod ?? "N/A"}
                </Badge>
              </DetailItem>
              <DetailItem icon={IconUserCircle} label="Clock-Out Method">
                <Badge variant="outline">
                  {detailData.clockOutMethod ?? "N/A"}
                </Badge>
              </DetailItem>
            </section>

            <Separator />

            {/* Time Activity Section */}
            <section className="space-y-4">
              <h3 className="font-semibold text-lg">Time Activity</h3>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem icon={IconClock} label="Check-In">
                  <span className="font-mono text-foreground text-lg">
                    {detailData.checkInTime
                      ? new Date(detailData.checkInTime).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "N/A"}
                  </span>
                </DetailItem>
                <DetailItem icon={IconClock} label="Check-Out">
                  <span className="font-mono text-foreground text-lg">
                    {detailData.checkOutTime
                      ? new Date(detailData.checkOutTime).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "N/A"}
                  </span>
                </DetailItem>
              </div>
              <DetailItem icon={IconClock} label="Break Duration">
                {detailData.breakDuration ?? 0} minutes
              </DetailItem>
            </section>

            {/* Work Sessions Section */}
            {detailData.workBlocks.length > 0 && (
              <>
                <Separator />
                <section className="space-y-4">
                  <h3 className="font-semibold text-lg">Work Sessions</h3>
                  <div className="space-y-4">
                    {detailData.workBlocks.map((block) => (
                      <div className="flex items-center gap-4" key={block.id}>
                        <IconBriefcase className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="font-medium text-sm">
                              {new Date(block.startedAt).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}{" "}
                              -{" "}
                              {block.endedAt
                                ? new Date(block.endedAt).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )
                                : "Now"}
                            </span>
                            <span className="text-muted-foreground text-sm">
                              {block.durationMinutes
                                ? `${Math.floor(block.durationMinutes / 60)}h ${
                                    block.durationMinutes % 60
                                  }m`
                                : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* Location & Notes Section */}
            {(detailData.location ||
              detailData.ipAddress ||
              detailData.notes ||
              detailData.adminNotes) && (
              <>
                <Separator />
                <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {detailData.location && (
                    <DetailItem icon={IconMapPin} label="Location">
                      {detailData.location}
                    </DetailItem>
                  )}
                  {detailData.ipAddress && (
                    <DetailItem icon={IconNetwork} label="IP Address">
                      <span className="font-mono">{detailData.ipAddress}</span>
                    </DetailItem>
                  )}
                  {detailData.notes && (
                    <DetailItem icon={IconFileDescription} label="Member Notes">
                      <p className="italic">"{detailData.notes}"</p>
                    </DetailItem>
                  )}
                  {detailData.adminNotes && (
                    <DetailItem icon={IconFileDescription} label="Admin Notes">
                      <p className="italic">"{detailData.adminNotes}"</p>
                    </DetailItem>
                  )}
                </section>
              </>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
