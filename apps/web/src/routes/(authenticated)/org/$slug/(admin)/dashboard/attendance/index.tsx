import {
  IconCalendar,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconDownload,
  IconFilter,
  IconMapPin,
  IconSearch,
  IconUsers,
} from "@tabler/icons-react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { queryUtils } from "@/utils/orpc";

const attendanceSearchSchema = z.object({
  page: z.number().min(1).catch(1),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.string().optional(),
});

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(admin)/dashboard/attendance/"
)({
  validateSearch: attendanceSearchSchema,
  loaderDeps: ({ search: { page, search, startDate, endDate, status } }) => ({
    page,
    search,
    startDate,
    endDate,
    status,
  }),
  beforeLoad: ({ context: { queryClient, queryUtils }, search }) => {
    queryClient.prefetchQuery(
      queryUtils.admin.attendance.getAttendanceStats.queryOptions({
        input: {},
      })
    );

    queryClient.prefetchQuery(
      queryUtils.admin.attendance.listAttendanceRecords.queryOptions({
        input: {
          page: search.page,
          perPage: 10,
          search: search.search,
          startDate: search.startDate,
          endDate: search.endDate,
        },
      })
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const {
    page = 1,
    search = "",
    startDate,
    endDate,
    status,
  } = Route.useSearch();
  const [searchInput, setSearchInput] = useState(search);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (startDate && endDate) {
      return {
        from: new Date(startDate),
        to: new Date(endDate),
      };
    }
    return;
  });
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    status
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [detailAttendanceId, setDetailAttendanceId] = useState<string | null>(
    null
  );

  const { data: stats } = useSuspenseQuery(
    queryUtils.admin.attendance.getAttendanceStats.queryOptions({ input: {} })
  );

  const { data: attendanceData } = useSuspenseQuery(
    queryUtils.admin.attendance.listAttendanceRecords.queryOptions({
      input: {
        page,
        perPage: 10,
        search,
        startDate,
        endDate,
      },
    })
  );

  const { data: detailData } = useQuery(
    queryUtils.admin.attendance.getAttendanceDetail.queryOptions({
      input: {
        attendanceId: detailAttendanceId ?? "",
      },
      enabled: !!detailAttendanceId,
    })
  );

  const handleSearch = () => {
    navigate({
      search: (prev) => ({ ...prev, page: 1, search: searchInput }),
    });
  };

  const handlePageChange = (newPage: number) => {
    navigate({
      search: (prev) => ({ ...prev, page: newPage }),
    });
  };

  const handleApplyFilters = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: 1,
        startDate: dateRange?.from?.toISOString().split("T")[0],
        endDate: dateRange?.to?.toISOString().split("T")[0],
        status: selectedStatus,
      }),
    });
    setFilterOpen(false);
  };

  const handleClearFilters = () => {
    setDateRange(undefined);
    setSelectedStatus(undefined);
    navigate({
      search: (prev) => ({
        ...prev,
        page: 1,
        startDate: undefined,
        endDate: undefined,
        status: undefined,
      }),
    });
    setFilterOpen(false);
  };

  const handleExportCSV = () => {
    try {
      // Create CSV content
      const headers = [
        "Member Name",
        "Email",
        "Date",
        "Check In",
        "Check Out",
        "Total Hours",
        "Break Duration (min)",
        "Status",
        "Location",
        "IP Address",
      ];

      const rows = attendanceData.records.map((record) => [
        record.user.name ?? "Unknown",
        record.user.email,
        new Date(record.date).toLocaleDateString("en-US"),
        record.checkInTime
          ? new Date(record.checkInTime).toLocaleString("en-US")
          : "-",
        record.checkOutTime
          ? new Date(record.checkOutTime).toLocaleString("en-US")
          : "-",
        record.totalHours ?? "-",
        record.breakDuration?.toString() ?? "0",
        record.status ?? "-",
        record.location ?? "-",
        record.ipAddress ?? "-",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendance-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("CSV exported successfully");
    } catch (error) {
      toast.error("Failed to export CSV");
    }
  };

  const formatTime = (timestamp: string | Date | null) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatHours = (hours: string | null) => {
    if (!hours) return "-";
    return `${hours}h`;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold text-2xl">Attendance</h1>
        <p className="text-muted-foreground text-sm">
          Manage and monitor member attendance records.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Members</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.totalMembers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Present Today</CardTitle>
            <IconCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.presentToday}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative flex-1 sm:max-w-sm">
              <IconSearch className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                placeholder="Search members..."
                value={searchInput}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Popover onOpenChange={setFilterOpen} open={filterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    className={cn(
                      (startDate || endDate || status) &&
                        "border-primary text-primary"
                    )}
                    size="sm"
                    variant="outline"
                  >
                    <IconFilter className="mr-2 h-4 w-4" />
                    Filter
                    {(startDate || endDate || status) && (
                      <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                        {[startDate, endDate, status].filter(Boolean).length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80">
                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-3 font-medium">Filter Attendance</h4>
                    </div>

                    {/* Date Range Filter */}
                    <div className="space-y-2">
                      <Label>Date Range</Label>
                      <Calendar
                        className="rounded-md border"
                        mode="range"
                        numberOfMonths={1}
                        onSelect={setDateRange}
                        selected={dateRange}
                      />
                      {dateRange?.from && (
                        <p className="text-muted-foreground text-xs">
                          {format(dateRange.from, "MMM dd, yyyy")}
                          {dateRange.to &&
                            ` - ${format(dateRange.to, "MMM dd, yyyy")}`}
                        </p>
                      )}
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        onValueChange={setSelectedStatus}
                        value={selectedStatus}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="late">Late</SelectItem>
                          <SelectItem value="excused">Excused</SelectItem>
                          <SelectItem value="partial">Partial</SelectItem>
                          <SelectItem value="holiday">Holiday</SelectItem>
                          <SelectItem value="sick_leave">Sick Leave</SelectItem>
                          <SelectItem value="work_from_home">
                            Work From Home
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={handleApplyFilters}
                        size="sm"
                      >
                        Apply
                      </Button>
                      <Button
                        onClick={handleClearFilters}
                        size="sm"
                        variant="outline"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Button onClick={handleExportCSV} size="sm" variant="outline">
                <IconDownload className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceData.records.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center" colSpan={6}>
                    <div className="py-8 text-muted-foreground">
                      No attendance records found.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                attendanceData.records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={record.user.image ?? undefined} />
                          <AvatarFallback>
                            {getInitials(record.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {record.user.name ?? "Unknown"}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {record.user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(record.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>{formatTime(record.checkInTime)}</TableCell>
                    <TableCell>{formatTime(record.checkOutTime)}</TableCell>
                    <TableCell>{formatHours(record.totalHours)}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => setDetailAttendanceId(record.id)}
                        size="icon"
                        variant="ghost"
                      >
                        <span className="text-lg">⋮</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {attendanceData.pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-muted-foreground text-sm">
                Showing {(page - 1) * 10 + 1} to{" "}
                {Math.min(page * 10, attendanceData.pagination.total)} of{" "}
                {attendanceData.pagination.total} results
              </div>
              <div className="flex gap-2">
                <Button
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                  size="sm"
                  variant="outline"
                >
                  <IconChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  disabled={page === attendanceData.pagination.totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  size="sm"
                  variant="outline"
                >
                  <IconChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Attendance View Sheet */}
      <Sheet
        onOpenChange={(open) => !open && setDetailAttendanceId(null)}
        open={!!detailAttendanceId}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          {detailData && (
            <>
              <SheetHeader>
                <SheetTitle>Attendance Details</SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Member Info */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs uppercase">
                    Member
                  </Label>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={detailData.user.image ?? undefined} />
                      <AvatarFallback>
                        {getInitials(detailData.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {detailData.user.name ?? "Unknown"}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {detailData.user.email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Basic Info Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">
                      Date
                    </Label>
                    <div className="flex items-center gap-2">
                      <IconCalendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(detailData.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">
                      Status
                    </Label>
                    <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm capitalize">
                      {detailData.status}
                    </div>
                  </div>
                </div>

                {/* Time Info */}
                <div className="space-y-3">
                  <Label className="text-muted-foreground text-xs uppercase">
                    Time Information
                  </Label>
                  <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <IconClock className="h-3 w-3" />
                        Check In
                      </div>
                      <div className="font-medium">
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
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <IconClock className="h-3 w-3" />
                        Check Out
                      </div>
                      <div className="font-medium">
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
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-xs">
                        Total Hours
                      </div>
                      <div className="font-medium">
                        {detailData.totalHours ?? "-"}h
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-xs">
                        Break Duration
                      </div>
                      <div className="font-medium">
                        {detailData.breakDuration ?? 0} min
                      </div>
                    </div>
                  </div>
                </div>

                {/* Work Sessions */}
                {detailData.workBlocks.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-muted-foreground text-xs uppercase">
                      Work Sessions
                    </Label>
                    <div className="space-y-2">
                      {detailData.workBlocks.map((block, index) => (
                        <div
                          className="flex items-center justify-between rounded-lg border p-3"
                          key={block.id}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-medium text-primary text-sm">
                              {index + 1}
                            </div>
                            <div className="space-y-1">
                              <div className="font-medium text-sm">
                                {new Date(block.startedAt).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  }
                                )}
                                {" - "}
                                {block.endedAt
                                  ? new Date(block.endedAt).toLocaleTimeString(
                                      "en-US",
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      }
                                    )
                                  : "Ongoing"}
                              </div>
                              {block.endReason && (
                                <div className="text-muted-foreground text-xs capitalize">
                                  Ended: {block.endReason.replace("_", " ")}
                                </div>
                              )}
                            </div>
                          </div>
                          {block.durationMinutes && (
                            <div className="font-medium text-sm">
                              {Math.floor(block.durationMinutes / 60)}h{" "}
                              {block.durationMinutes % 60}m
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location Info */}
                {(detailData.location || detailData.ipAddress) && (
                  <div className="space-y-3">
                    <Label className="text-muted-foreground text-xs uppercase">
                      Location Information
                    </Label>
                    <div className="space-y-2 rounded-lg border p-4">
                      {detailData.location && (
                        <div className="flex items-start gap-2">
                          <IconMapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-muted-foreground text-xs">
                              Location
                            </div>
                            <div className="text-sm">{detailData.location}</div>
                          </div>
                        </div>
                      )}
                      {detailData.ipAddress && (
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5 h-4 w-4 text-muted-foreground">
                            🌐
                          </div>
                          <div>
                            <div className="text-muted-foreground text-xs">
                              IP Address
                            </div>
                            <div className="font-mono text-sm">
                              {detailData.ipAddress}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {(detailData.notes || detailData.adminNotes) && (
                  <div className="space-y-3">
                    <Label className="text-muted-foreground text-xs uppercase">
                      Notes
                    </Label>
                    <div className="space-y-2">
                      {detailData.notes && (
                        <div className="rounded-lg border p-3">
                          <div className="mb-1 text-muted-foreground text-xs">
                            Member Notes
                          </div>
                          <div className="text-sm">{detailData.notes}</div>
                        </div>
                      )}
                      {detailData.adminNotes && (
                        <div className="rounded-lg border p-3">
                          <div className="mb-1 text-muted-foreground text-xs">
                            Admin Notes
                          </div>
                          <div className="text-sm">{detailData.adminNotes}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div className="space-y-2 rounded-lg border p-4 text-muted-foreground text-xs">
                  <div className="flex justify-between">
                    <span>Manual Entry:</span>
                    <span>{detailData.isManualEntry ? "Yes" : "No"}</span>
                  </div>
                  {detailData.clockInMethod && (
                    <div className="flex justify-between">
                      <span>Check In Method:</span>
                      <span className="capitalize">
                        {detailData.clockInMethod}
                      </span>
                    </div>
                  )}
                  {detailData.clockOutMethod && (
                    <div className="flex justify-between">
                      <span>Check Out Method:</span>
                      <span className="capitalize">
                        {detailData.clockOutMethod}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
