import { useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { queryUtils } from "@/utils/orpc";

export function AttendanceHistory() {
  const { data: history } = useSuspenseQuery(
    queryUtils.member.attendance.getHistory.queryOptions()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Total Hours</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No attendance records found.
                </TableCell>
              </TableRow>
            ) : (
              history.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    {format(new Date(record.date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    {record.checkInTime
                      ? format(new Date(record.checkInTime), "h:mm a")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {record.checkOutTime
                      ? format(new Date(record.checkOutTime), "h:mm a")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {record.totalHours ? `${record.totalHours}h` : "-"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={record.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    present: "default", // green-ish usually, but default is black/white. We might want custom colors.
    absent: "destructive",
    late: "secondary",
    excused: "outline",
    partial: "secondary",
    holiday: "outline",
    sick_leave: "destructive",
    work_from_home: "secondary",
  };

  const variant = variants[status] || "outline";
  
  // Capitalize first letter
  const label = status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");

  return <Badge variant={variant}>{label}</Badge>;
}
