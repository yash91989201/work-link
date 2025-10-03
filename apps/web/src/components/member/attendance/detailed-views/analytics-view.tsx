import {
  AlertCircle,
  Award,
  Clock,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function AnalyticsView() {
  // Analytics data
  const monthlyTrends = [
    { month: "Jan", present: 22, absent: 1, late: 2, totalHours: 186 },
    { month: "Feb", present: 20, absent: 2, late: 3, totalHours: 178 },
    { month: "Mar", present: 23, absent: 0, late: 1, totalHours: 195 },
    { month: "Apr", present: 21, absent: 1, late: 2, totalHours: 182 },
    { month: "May", present: 22, absent: 1, late: 1, totalHours: 188 },
    { month: "Jun", present: 20, absent: 2, late: 3, totalHours: 175 },
  ];

  const performanceMetrics = [
    {
      title: "Attendance Rate",
      value: 94.2,
      target: 95,
      unit: "%",
      trend: "down",
      change: -0.8,
      icon: Target,
      color: "blue",
    },
    {
      title: "Avg Daily Hours",
      value: 8.7,
      target: 8,
      unit: "hrs",
      trend: "up",
      change: 0.3,
      icon: Clock,
      color: "green",
    },
    {
      title: "On-time Arrival",
      value: 88.5,
      target: 90,
      unit: "%",
      trend: "up",
      change: 2.1,
      icon: Award,
      color: "purple",
    },
    {
      title: "Absenteeism",
      value: 2.1,
      target: 2,
      unit: "days/mo",
      trend: "down",
      change: -0.5,
      icon: AlertCircle,
      color: "red",
    },
  ];

  const weeklyPattern = [
    { day: "Mon", avgHours: 8.5, attendance: 96 },
    { day: "Tue", avgHours: 8.8, attendance: 94 },
    { day: "Wed", avgHours: 9.1, attendance: 92 },
    { day: "Thu", avgHours: 8.6, attendance: 95 },
    { day: "Fri", avgHours: 7.9, attendance: 90 },
    { day: "Sat", avgHours: 4.2, attendance: 60 },
    { day: "Sun", avgHours: 2.1, attendance: 30 },
  ];

  const currentMonthStats = {
    totalDays: 30,
    workingDays: 22,
    present: 21,
    absent: 1,
    late: 2,
    halfDay: 0,
    leave: 0,
    totalHours: 178.5,
    avgHours: 8.5,
    overtime: 12.5,
  };

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {performanceMetrics.map((metric, index) => (
          <Card key={index.toString()}>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <metric.icon className={`h-8 w-8 text-${metric.color}-500`} />
                <div className="flex items-center gap-1">
                  {metric.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`font-medium text-sm ${
                      metric.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {Math.abs(metric.change)}%
                  </span>
                </div>
              </div>
              <div>
                <div className="font-bold text-2xl">
                  {metric.value}
                  {metric.unit}
                </div>
                <div className="mb-2 text-gray-600 text-sm">{metric.title}</div>
                <div className="text-gray-500 text-xs">
                  Target: {metric.target}
                  {metric.unit}
                </div>
                <Progress
                  className="mt-2 h-2"
                  value={(metric.value / metric.target) * 100}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current Month Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Month Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="font-bold text-2xl text-green-600">
                {currentMonthStats.present}
              </div>
              <div className="text-gray-600 text-sm">Present</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-2xl text-red-600">
                {currentMonthStats.absent}
              </div>
              <div className="text-gray-600 text-sm">Absent</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-2xl text-blue-600">
                {currentMonthStats.totalHours}h
              </div>
              <div className="text-gray-600 text-sm">Total Hours</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-2xl text-purple-600">
                {currentMonthStats.overtime}h
              </div>
              <div className="text-gray-600 text-sm">Overtime</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Attendance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyTrends.map((trend, index) => (
                <div
                  className="flex items-center justify-between"
                  key={index.toString()}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 font-medium text-sm">
                      {trend.month}
                    </span>
                    <div className="flex gap-2">
                      <Badge className="text-xs" variant="default">
                        P: {trend.present}
                      </Badge>
                      <Badge className="text-xs" variant="destructive">
                        A: {trend.absent}
                      </Badge>
                      <Badge className="text-xs" variant="secondary">
                        L: {trend.late}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-gray-600 text-sm">
                    {trend.totalHours}h
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Pattern Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyPattern.map((day, index) => (
                <div className="space-y-2" key={index.toString()}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{day.day}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600 text-sm">
                        {day.avgHours}h avg
                      </span>
                      <span className="text-gray-600 text-sm">
                        {day.attendance}%
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Progress
                      className="h-2 flex-1"
                      value={day.avgHours * 10}
                    />
                    <Progress className="h-2 flex-1" value={day.attendance} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <TrendingUp className="mt-0.5 h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium text-sm">Improving Pattern</div>
                  <div className="text-gray-600 text-xs">
                    Your on-time arrival rate has improved by 2.1% this month
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Award className="mt-0.5 h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-medium text-sm">
                    Consistent Performer
                  </div>
                  <div className="text-gray-600 text-xs">
                    Maintained 94%+ attendance rate for 3 consecutive months
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-500" />
                <div>
                  <div className="font-medium text-sm">
                    Areas for Improvement
                  </div>
                  <div className="text-gray-600 text-xs">
                    Consider arriving 10 minutes earlier to improve on-time rate
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 text-purple-500" />
                <div>
                  <div className="font-medium text-sm">Optimal Schedule</div>
                  <div className="text-gray-600 text-xs">
                    Your most productive hours are between 10 AM - 4 PM
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

