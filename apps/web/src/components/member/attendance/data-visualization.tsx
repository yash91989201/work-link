import {
  BarChart3,
  Calendar,
  Clock,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function DataVisualization() {
  // Monthly attendance data for line chart
  const monthlyData = [
    { month: "Jan", attendance: 95, hours: 168 },
    { month: "Feb", attendance: 92, hours: 160 },
    { month: "Mar", attendance: 96, hours: 172 },
    { month: "Apr", attendance: 90, hours: 158 },
    { month: "May", attendance: 94, hours: 165 },
    { month: "Jun", attendance: 88, hours: 154 },
  ];

  // Weekly distribution data for bar chart
  const weeklyData = [
    { day: "Mon", hours: 8.5, attendance: 100 },
    { day: "Tue", hours: 9.0, attendance: 100 },
    { day: "Wed", hours: 8.2, attendance: 100 },
    { day: "Thu", hours: 7.8, attendance: 100 },
    { day: "Fri", hours: 6.5, attendance: 100 },
    { day: "Sat", hours: 2.0, attendance: 50 },
    { day: "Sun", hours: 0, attendance: 0 },
  ];

  // Team comparison data
  const teamData = [
    { name: "You", attendance: 94, rank: 3 },
    { name: "Sarah", attendance: 98, rank: 1 },
    { name: "Mike", attendance: 96, rank: 2 },
    { name: "Emily", attendance: 92, rank: 4 },
    { name: "David", attendance: 90, rank: 5 },
  ];

  // Attendance statistics
  const attendanceStats = [
    {
      title: "This Month",
      value: "94%",
      change: 2,
      trend: "up",
      icon: Calendar,
      color: "blue",
    },
    {
      title: "Average Hours/Day",
      value: "8.2h",
      change: 0.3,
      trend: "up",
      icon: Clock,
      color: "green",
    },
    {
      title: "Team Ranking",
      value: "#3",
      change: 1,
      trend: "up",
      icon: Users,
      color: "purple",
    },
    {
      title: "Perfect Weeks",
      value: "2",
      change: 1,
      trend: "up",
      icon: BarChart3,
      color: "orange",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
      {/* Stats Cards */}
      {attendanceStats.map((stat, index) => (
        <Card key={index.toString()}>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <stat.icon className={`h-8 w-8 text-${stat.color}-500`} />
              <div className="flex items-center gap-1">
                {stat.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={`font-medium text-sm ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.change > 0 ? "+" : ""}
                  {stat.change}
                </span>
              </div>
            </div>
            <div>
              <div className="font-bold text-2xl">{stat.value}</div>
              <div className="text-gray-600 text-sm">{stat.title}</div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Monthly Trend Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Attendance Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-end justify-between gap-2">
            {monthlyData.map((data, index) => (
              <div
                className="flex flex-1 flex-col items-center gap-2"
                key={index.toString()}
              >
                <div className="relative w-full">
                  <div
                    className="rounded-t-md bg-blue-500 transition-all duration-300 hover:bg-blue-600"
                    style={{ height: `${(data.attendance / 100) * 200}px` }}
                  />
                  <div className="absolute top-0 right-0 left-0 pt-2 text-center font-medium text-white text-xs">
                    {data.attendance}%
                  </div>
                </div>
                <div className="text-gray-600 text-xs">{data.month}</div>
                <div className="text-gray-500 text-xs">{data.hours}h</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Distribution Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Weekly Hours Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weeklyData.map((data, index) => (
              <div className="flex items-center gap-3" key={index.toString()}>
                <div className="w-12 font-medium text-sm">{data.day}</div>
                <div className="flex-1">
                  <Progress className="h-6" value={(data.hours / 10) * 100} />
                </div>
                <div className="w-16 text-right text-sm">{data.hours}h</div>
                <div className="w-12 text-right">
                  {data.attendance > 0 && (
                    <Badge className="text-xs" variant="outline">
                      {data.attendance}%
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Comparison */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Attendance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamData.map((member, index) => (
              <div className="flex items-center gap-3" key={index.toString()}>
                <div className="w-20">
                  <div
                    className={`font-medium text-sm ${
                      member.name === "You" ? "text-blue-600" : ""
                    }`}
                  >
                    {member.name}
                  </div>
                </div>
                <div className="flex-1">
                  <Progress
                    className={`h-6 ${
                      member.name === "You" ? "bg-blue-100" : ""
                    }`}
                    value={member.attendance}
                  />
                </div>
                <div className="w-12 text-right">
                  <span
                    className={`font-medium text-sm ${
                      member.name === "You" ? "text-blue-600" : ""
                    }`}
                  >
                    {member.attendance}%
                  </span>
                </div>
                <div className="w-8 text-center">
                  <Badge
                    className="text-xs"
                    variant={member.rank === 1 ? "default" : "outline"}
                  >
                    #{member.rank}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Quick Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="mb-1 font-medium text-green-800">
                Excellent Attendance
              </div>
              <div className="text-green-600 text-sm">
                You're in the top 3 team members this month
              </div>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="mb-1 font-medium text-blue-800">
                Consistent Performer
              </div>
              <div className="text-blue-600 text-sm">
                Maintained 90%+ attendance for 6 months
              </div>
            </div>
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="mb-1 font-medium text-yellow-800">
                Weekend Worker
              </div>
              <div className="text-sm text-yellow-600">
                Worked 2 weekends this month
              </div>
            </div>
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
              <div className="mb-1 font-medium text-purple-800">
                Time Management
              </div>
              <div className="text-purple-600 text-sm">
                Average 8.2 hours per workday
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
