import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconFilter,
  IconSearch,
  IconUsers,
} from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { queryUtils } from "@/utils/orpc";

const attendanceSearchSchema = z.object({
  page: z.number().min(1).catch(1),
  search: z.string().optional(),
});

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(admin)/dashboard/attendance/"
)({
  validateSearch: attendanceSearchSchema,
  loaderDeps: ({ search: { page, search } }) => ({ page, search }),
  beforeLoad: ({ context: { queryClient, queryUtils }, deps }) => {
    queryClient.prefetchQuery(
      queryUtils.admin.attendance.getAttendanceStats.queryOptions({})
    );
    queryClient.prefetchQuery(
      queryUtils.admin.attendance.listAttendanceRecords.queryOptions({
        page: deps.page,
        perPage: 10,
        search: deps.search,
      })
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const { page = 1, search = "" } = Route.useSearch();
  const [searchInput, setSearchInput] = useState(search);

  const { data: stats } = useSuspenseQuery(
    queryUtils.admin.attendance.getAttendanceStats.queryOptions({})
  );

  const { data: attendanceData } = useSuspenseQuery(
    queryUtils.admin.attendance.listAttendanceRecords.queryOptions({
      page,
      perPage: 10,
      search,
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
              <IconSearch className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search members..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <IconFilter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button size="sm" variant="outline">
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
                      <Button size="icon" variant="ghost">
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
                  size="sm"
                  variant="outline"
                  onClick={() => handlePageChange(page - 1)}
                >
                  <IconChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  disabled={page === attendanceData.pagination.totalPages}
                  size="sm"
                  variant="outline"
                  onClick={() => handlePageChange(page + 1)}
                >
                  <IconChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
