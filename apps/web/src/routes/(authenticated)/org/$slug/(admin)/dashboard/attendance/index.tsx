import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AttendanceStats } from "@/components/admin/attendance/attendance-stats";
import { AttendanceTable } from "@/components/admin/attendance/attendance-table";

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
      <AttendanceStats />

      {/* Table Section */}
      <AttendanceTable />
    </div>
  );
}
