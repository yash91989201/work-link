import type { AttendanceAnalyticsOutput } from "@work-link/api/lib/schemas/attendance";
import { Award, Clock3, Coffee, Flame, Laptop, Zap } from "lucide-react";
import type React from "react";
import type { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type AttendanceAnalytics = z.infer<typeof AttendanceAnalyticsOutput>;

type Props = {
  summary: AttendanceAnalytics["summary"];
  punctuality: AttendanceAnalytics["punctuality"];
};

const metrics = [
  {
    key: "attendance",
    title: "Attendance rate",
    icon: Award,
    accent: "text-emerald-600",
  },
  {
    key: "hours",
    title: "Avg. hours / day",
    icon: Clock3,
    accent: "text-sky-600",
  },
  {
    key: "overtime",
    title: "Overtime",
    icon: Flame,
    accent: "text-amber-600",
  },
  {
    key: "breaks",
    title: "Avg. break",
    icon: Coffee,
    accent: "text-rose-600",
  },
] as const;

export function AttendanceAnalyticsSummary({ summary, punctuality }: Props) {
  const items = [
    {
      key: metrics[0].key,
      title: metrics[0].title,
      icon: metrics[0].icon,
      accent: metrics[0].accent,
      primary: `${summary.attendanceRate.toFixed(1)}%`,
      hint: `${summary.presentDays + summary.excusedDays} of ${
        summary.totalDays
      } days attended`,
      progress: summary.attendanceRate,
    },
    {
      key: metrics[1].key,
      title: metrics[1].title,
      icon: metrics[1].icon,
      accent: metrics[1].accent,
      primary: `${summary.averageDailyHours.toFixed(1)}h`,
      hint: `${summary.totalHours.toFixed(1)}h this period`,
    },
    {
      key: metrics[2].key,
      title: metrics[2].title,
      icon: metrics[2].icon,
      accent: metrics[2].accent,
      primary: `${summary.overtimeHours.toFixed(1)}h`,
      hint: "Extra hours logged",
    },
    {
      key: metrics[3].key,
      title: metrics[3].title,
      icon: metrics[3].icon,
      accent: metrics[3].accent,
      primary: `${Math.round(summary.averageBreakMinutes)}m`,
      hint: "Average break per shift",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card className="h-full border-border/60" key={item.key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm">{item.title}</CardTitle>
            <span
              className={cn(
                "rounded-full bg-muted p-2 shadow-inner",
                item.accent
              )}
            >
              <item.icon className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-2xl">{item.primary}</span>
              {item.key === "hours" && punctuality.averageCheckInTime ? (
                <div className="text-muted-foreground text-xs">
                  Avg check-in {punctuality.averageCheckInTime}
                </div>
              ) : null}
              {item.key === "overtime" && punctuality.averageCheckOutTime ? (
                <div className="text-muted-foreground text-xs">
                  Avg check-out {punctuality.averageCheckOutTime}
                </div>
              ) : null}
            </div>
            <div className="text-muted-foreground text-xs">{item.hint}</div>
            {item.key === "attendance" ? (
              <Progress
                className="h-2"
                max={100}
                value={summary.attendanceRate}
              />
            ) : null}
          </CardContent>
        </Card>
      ))}

      <Card className="md:col-span-2 xl:col-span-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Participation highlights</CardTitle>
          <Zap className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <Insight
            icon={<Laptop className="h-4 w-4 text-sky-600" />}
            label="Remote days"
            value={summary.remoteDays}
          />
          <Insight
            icon={<Clock3 className="h-4 w-4 text-amber-600" />}
            label="Late arrivals"
            value={summary.lateDays}
          />
          <Insight
            icon={<Award className="h-4 w-4 text-emerald-600" />}
            label="Excused days"
            value={summary.excusedDays}
          />
          <Insight
            icon={<Flame className="h-4 w-4 text-rose-600" />}
            label="Absences"
            value={summary.absentDays}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Insight({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2">
      <div className="rounded-full bg-background p-2 shadow-sm">{icon}</div>
      <div>
        <div className="font-medium leading-tight">{value}</div>
        <div className="text-muted-foreground text-xs">{label}</div>
      </div>
    </div>
  );
}
