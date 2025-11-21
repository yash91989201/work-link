import {
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconFilter,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { startOfMonth, subDays } from "date-fns";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
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
import { Separator } from "@/components/ui/separator";
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
import { AttendanceDetailsSheet } from "./attendance-details-sheet";

interface AttendanceSearch {
  page: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export function AttendanceTable() {
  const navigate = useNavigate({
    from: "/org/$slug/dashboard/attendance",
  });

  const searchParams = useSearch({
    from: "/(authenticated)/org/$slug/(admin)/dashboard/attendance/",
  }) as AttendanceSearch;

  const { page = 1, search = "", startDate, endDate, status } = searchParams;

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

  const { data: attendanceData } = useSuspenseQuery(
    queryUtils.admin.attendance.listAttendanceRecords.queryOptions({
      input: {
        page,
        perPage: 10,
        search,
        startDate,
        endDate,
        status: status as any,
      },
    })
  );

  const handleSearch = () => {
    navigate({
      search: (prev) => ({ ...prev, page: 1, search: searchInput }),
    });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    navigate({
      search: (prev) => ({ ...prev, page: 1, search: "" }),
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
    } catch {
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

  const activeFilterCount = [startDate, endDate, status].filter(Boolean).length;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative flex-1 sm:max-w-sm">
              <InputGroup>
                <InputGroupAddon>
                  <IconSearch className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  placeholder="Search members..."
                  value={searchInput}
                />
                {searchInput && (
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      onClick={handleClearSearch}
                      size="icon-xs"
                      variant="ghost"
                    >
                      <IconX className="h-4 w-4" />
                    </InputGroupButton>
                  </InputGroupAddon>
                )}
              </InputGroup>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Popover onOpenChange={setFilterOpen} open={filterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    className={cn(
                      activeFilterCount > 0 && "border-primary text-primary"
                    )}
                    size="sm"
                    variant="outline"
                  >
                    <IconFilter className="mr-2 h-4 w-4" />
                    Filter
                    {activeFilterCount > 0 && (
                      <Badge className="ml-2 h-5 min-w-5 px-1">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-auto p-0">
                  <div className="flex flex-col sm:flex-row">
                    <Calendar
                      mode="range"
                      numberOfMonths={1}
                      onSelect={setDateRange}
                      selected={dateRange}
                    />

                    <div className="flex w-full flex-col gap-4 border-l p-4 sm:w-64">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Filters</h4>
                        <Button
                          className="h-auto p-0 text-muted-foreground hover:text-foreground"
                          onClick={handleClearFilters}
                          variant="ghost"
                        >
                          Reset
                        </Button>
                      </div>
                      <Separator />

                      {/* Status Filter */}
                      <div className="space-y-2">
                        <Label className="text-xs">Status</Label>
                        <Select
                          onValueChange={setSelectedStatus}
                          value={selectedStatus}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="All statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="present">Present</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                            <SelectItem value="late">Late</SelectItem>
                            <SelectItem value="excused">Excused</SelectItem>
                            <SelectItem value="partial">Partial</SelectItem>
                            <SelectItem value="holiday">Holiday</SelectItem>
                            <SelectItem value="sick_leave">
                              Sick Leave
                            </SelectItem>
                            <SelectItem value="work_from_home">
                              Work From Home
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Quick Date Filters */}
                      <div className="space-y-2">
                        <Label className="text-xs">Quick Dates</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            className="h-8 text-xs"
                            onClick={() =>
                              setDateRange({
                                from: new Date(),
                                to: new Date(),
                              })
                            }
                            variant="outline"
                          >
                            Today
                          </Button>
                          <Button
                            className="h-8 text-xs"
                            onClick={() =>
                              setDateRange({
                                from: subDays(new Date(), 1),
                                to: subDays(new Date(), 1),
                              })
                            }
                            variant="outline"
                          >
                            Yesterday
                          </Button>
                          <Button
                            className="h-8 text-xs"
                            onClick={() =>
                              setDateRange({
                                from: subDays(new Date(), 7),
                                to: new Date(),
                              })
                            }
                            variant="outline"
                          >
                            Last 7 Days
                          </Button>
                          <Button
                            className="h-8 text-xs"
                            onClick={() =>
                              setDateRange({
                                from: startOfMonth(new Date()),
                                to: new Date(),
                              })
                            }
                            variant="outline"
                          >
                            This Month
                          </Button>
                        </div>
                      </div>

                      <div className="mt-auto pt-2">
                        <Button
                          className="w-full"
                          onClick={handleApplyFilters}
                          size="sm"
                        >
                          Apply Filters
                        </Button>
                      </div>
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

      <AttendanceDetailsSheet
        attendanceId={detailAttendanceId}
        onClose={() => setDetailAttendanceId(null)}
      />
    </>
  );
}
