import type { AttendanceAnalyticsOutput } from "@work-link/api/lib/schemas/attendance";
import { format } from "date-fns";
import { Clock3, Sparkles, Sunrise, Sunset } from "lucide-react";
import type { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type AttendanceAnalytics = z.infer<typeof AttendanceAnalyticsOutput>;

type Props = {
  punctuality: AttendanceAnalytics["punctuality"];
  streaks: AttendanceAnalytics["streaks"];
  summary: AttendanceAnalytics["summary"];
};

export function AttendanceInsights({ punctuality, streaks, summary }: Props) {
  const punctualityRows = [
    {
      label: "Average check-in",
      value: punctuality.averageCheckInTime ?? "—",
      icon: <Sunrise className="h-4 w-4 text-amber-500" />,
    },
    {
      label: "Average check-out",
      value: punctuality.averageCheckOutTime ?? "—",
      icon: <Sunset className="h-4 w-4 text-sky-600" />,
    },
    {
      label: "Earliest check-in",
      value: formatMaybeDate(punctuality.earliestCheckIn),
      icon: <Clock3 className="h-4 w-4 text-emerald-600" />,
    },
    {
      label: "Latest check-out",
      value: formatMaybeDate(punctuality.latestCheckOut),
      icon: <Clock3 className="h-4 w-4 text-indigo-600" />,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">Insights</CardTitle>
          <Badge className="gap-1" variant="secondary">
            <Sparkles className="h-3.5 w-3.5" />
            Personalized
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Punctuality signals and streaks pulled from your attendance history.
        </p>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
          <div className="font-semibold text-muted-foreground text-sm">
            Punctuality
          </div>
          <div className="space-y-3">
            {punctualityRows.map((row) => (
              <div
                className="flex items-center justify-between"
                key={row.label}
              >
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-background p-2 shadow-sm">
                    {row.icon}
                  </div>
                  <span className="text-sm">{row.label}</span>
                </div>
                <span className="font-mono text-muted-foreground text-sm">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
          <div className="font-semibold text-muted-foreground text-sm">
            Reliability
          </div>
          <div className="space-y-2">
            <StreakRow label="Current streak" value={streaks.currentStreak} />
            <StreakRow
              label="Best streak"
              tone="positive"
              value={streaks.longestStreak}
            />
            <Separator className="my-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total days tracked</span>
              <span className="font-medium">{summary.totalDays}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Late arrivals</span>
              <span className="font-medium">{summary.lateDays}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StreakRow({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "positive";
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-background px-3 py-2 shadow-sm">
      <span className="text-sm">{label}</span>
      <span
        className={`font-semibold ${
          tone === "positive" ? "text-emerald-600" : "text-foreground"
        }`}
      >
        {value} days
      </span>
    </div>
  );
}

function formatMaybeDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return format(date, "MMM d, h:mm a");
}
