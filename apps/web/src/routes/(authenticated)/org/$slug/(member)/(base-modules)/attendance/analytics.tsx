import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { queryUtils } from "@/utils/orpc";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(member)/(base-modules)/attendance/analytics"
)({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { data: analytics } = useSuspenseQuery(
    queryUtils.member.attendance.getAnalytics.queryOptions()
  );

  const pieData = [
    { name: "On Time", value: analytics.onTimeArrivals, color: "#22c55e" }, // green-500
    { name: "Late", value: analytics.lateArrivals, color: "#f97316" }, // orange-500
    { name: "Absent", value: analytics.absentDays, color: "#ef4444" }, // red-500
  ].filter((d) => d.value > 0);

  return (
    <div className="container mx-auto space-y-8 p-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">
          Attendance Analytics
        </h1>
        <p className="text-muted-foreground">
          Overview of your attendance performance for this month.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Total Days Present
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {analytics.totalDaysPresent}
            </div>
            <p className="text-muted-foreground text-xs">Days this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Total Hours Worked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {analytics.totalHoursWorked}h
            </div>
            <p className="text-muted-foreground text-xs">Hours this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Avg. Hours / Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {analytics.averageHoursPerDay}h
            </div>
            <p className="text-muted-foreground text-xs">Per present day</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Late Arrivals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{analytics.lateArrivals}</div>
            <p className="text-muted-foreground text-xs">Days late</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Daily Hours Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Daily Work Hours</CardTitle>
            <CardDescription>Hours worked each day this month.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={analytics.dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    axisLine={false}
                    dataKey="date"
                    minTickGap={30}
                    tickFormatter={(value) => format(parseISO(value), "d MMM")}
                    tickLine={false}
                    tickMargin={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickFormatter={(value) => `${value}h`}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] text-muted-foreground uppercase">
                                  Date
                                </span>
                                <span className="font-bold text-muted-foreground">
                                  {format(parseISO(label), "MMM d, yyyy")}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] text-muted-foreground uppercase">
                                  Hours
                                </span>
                                <span className="font-bold">
                                  {payload[0].value}h
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                    cursor={{ fill: "transparent" }}
                  />
                  <Bar
                    className="fill-primary"
                    dataKey="hours"
                    fill="currentColor"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution Chart */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Attendance Status</CardTitle>
            <CardDescription>
              Distribution of attendance status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer height="100%" width="100%">
                <PieChart>
                  <Pie
                    cx="50%"
                    cy="50%"
                    data={pieData}
                    dataKey="value"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        fill={entry.color}
                        key={`cell-${index.toString()}`}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
