import type { AttendanceAnalyticsOutput } from "@work-link/api/lib/schemas/attendance";
import { format } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import type { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

type AttendanceAnalytics = z.infer<typeof AttendanceAnalyticsOutput>;

type Props = {
  dailyTrends: AttendanceAnalytics["dailyTrends"];
};

const chartConfig = {
  hours: {
    label: "Hours worked",
    color: "hsl(217, 91%, 60%)",
  },
  breaks: {
    label: "Breaks",
    color: "hsl(12, 86%, 63%)",
  },
} satisfies ChartConfig;

export function AttendanceTrendChart({ dailyTrends }: Props) {
  const data = dailyTrends.map((item) => ({
    label: format(new Date(item.date), "MM/dd"),
    hours: item.totalHours ?? 0,
    breaks: item.breakMinutes ? Number(item.breakMinutes) / 60 : 0,
  }));

  const hasData = data.some((item) => item.hours > 0 || item.breaks > 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-base">
          Productivity trend
          <span className="text-muted-foreground text-xs">Viewed by day</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {dailyTrends.length === 0 || !hasData ? (
          <EmptyState />
        ) : (
          <ChartContainer config={chartConfig}>
            <AreaChart accessibilityLayer data={data}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
              <XAxis
                axisLine={false}
                dataKey="label"
                tickFormatter={(value: string) => value}
                tickLine={false}
                tickMargin={8}
              />
              <YAxis
                axisLine={false}
                tickFormatter={(value: number) => `${value}h`}
                tickLine={false}
                tickMargin={8}
                width={40}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelClassName="font-medium"
                    labelFormatter={(label) => `Day ${label}`}
                  />
                }
                cursor={{ strokeDasharray: "4 4" }}
              />
              <Area
                activeDot={{ r: 3 }}
                dataKey="hours"
                fill="var(--color-hours)"
                fillOpacity={0.15}
                stroke="var(--color-hours)"
                strokeWidth={2}
                type="monotone"
              />
              <Area
                activeDot={{ r: 3 }}
                dataKey="breaks"
                fill="var(--color-breaks)"
                fillOpacity={0.12}
                stroke="var(--color-breaks)"
                strokeWidth={2}
                type="monotone"
              />
              <ReferenceLine
                label={{
                  position: "insideTopRight",
                  value: "Target 8h",
                  fill: "var(--muted-foreground)",
                  fontSize: 10,
                }}
                stroke="hsl(0, 0%, 65%)"
                strokeDasharray="5 5"
                y={8}
              />
              <ChartLegend
                content={<ChartLegendContent />}
                verticalAlign="bottom"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border bg-muted/40 p-6">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <p className="mt-4 text-muted-foreground text-sm">
        No working hours recorded for this range yet. Tap a different timeframe
        or start logging attendance to see trends.
      </p>
    </div>
  );
}
