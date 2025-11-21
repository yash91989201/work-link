import { IconCheck, IconUsers } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { queryUtils } from "@/utils/orpc";

export function AttendanceStats() {
  const { data: stats } = useSuspenseQuery(
    queryUtils.admin.attendance.getAttendanceStats.queryOptions({ input: {} })
  );

  return (
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
  );
}
