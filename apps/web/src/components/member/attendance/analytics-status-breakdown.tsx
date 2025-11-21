import type { AttendanceAnalyticsOutput } from "@work-link/api/lib/schemas/attendance";
import { Cell, Pie, PieChart } from "recharts";
import type { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AttendanceAnalytics = z.infer<typeof AttendanceAnalyticsOutput>;

type Props = {
  statusBreakdown: AttendanceAnalytics["statusBreakdown"];
  summary: AttendanceAnalytics["summary"];
};

const statusColors: Record<string, string> = {
  present: "#22c55e",
  late: "#f97316",
  partial: "#0ea5e9",
  work_from_home: "#a855f7",
  excused: "#06b6d4",
  holiday: "#94a3b8",
  sick_leave: "#ef4444",
  absent: "#1f2937",
};

export function AttendanceStatusBreakdown({ statusBreakdown, summary }: Props) {
  const total = summary.totalDays || 1;
  const data = statusBreakdown.filter((item) => item.count > 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Status breakdown</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {data.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No attendance data available for this period.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center">
              <PieChart height={220} width={260}>
                <Pie
                  data={data}
                  dataKey="count"
                  innerRadius={70}
                  nameKey="status"
                  outerRadius={100}
                  paddingAngle={4}
                >
                  {data.map((entry) => (
                    <Cell
                      fill={statusColors[entry.status] ?? "#334155"}
                      key={entry.status}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
              </PieChart>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {statusBreakdown.map((status) => (
                <BreakdownRow
                  color={statusColors[status.status] ?? "#334155"}
                  count={status.count}
                  key={status.status}
                  label={formatStatus(status.status)}
                  value={`${Math.round((status.count / total) * 100)}%`}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BreakdownRow({
  label,
  value,
  count,
  color,
}: {
  label: string;
  value: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-3 py-2">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="h-2.5 w-2.5 rounded-full"
          style={{ background: color }}
        />
        <div>
          <div className="font-medium leading-tight">{label}</div>
          <div className="text-muted-foreground text-xs">
            {count} day{count === 1 ? "" : "s"}
          </div>
        </div>
      </div>
      <Badge variant="outline">{value}</Badge>
    </div>
  );
}

function formatStatus(status: string) {
  return status
    .split("_")
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}
