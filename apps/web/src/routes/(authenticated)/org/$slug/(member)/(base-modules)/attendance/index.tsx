import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  Award,
  Calendar,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { DataVisualization } from "@/components/member/attendance/data-visualization";
import { AnalyticsView } from "@/components/member/attendance/detailed-views/analytics-view";
import { AttendanceCalendarView } from "@/components/member/attendance/detailed-views/attendance-calendar-view";
import { AttendanceHistoryView } from "@/components/member/attendance/detailed-views/attendance-history-view";
import { LeaveBalanceView } from "@/components/member/attendance/detailed-views/leave-balance-view";
import { Greeting } from "@/components/member/attendance/greeting";
import { MarkAttendance } from "@/components/member/attendance/mark-attendance";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(member)/(base-modules)/attendance/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Attendance</h1>
          <p className="text-gray-600">
            Track your attendance, view analytics, and manage leave requests
          </p>
        </div>
      </div>

      {/* Greeting and Punch In Section */}
      <Greeting />

      <MarkAttendance />

      {/* Data Visualization Section */}
      <DataVisualization />

      {/* Detailed Views Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Detailed Attendance Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            className="w-full"
            onValueChange={setActiveTab}
            value={activeTab}
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger className="flex items-center gap-2" value="overview">
                <TrendingUp className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger className="flex items-center gap-2" value="calendar">
                <Calendar className="h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger className="flex items-center gap-2" value="history">
                <Clock className="h-4 w-4" />
                History
              </TabsTrigger>
              <TabsTrigger
                className="flex items-center gap-2"
                value="analytics"
              >
                <Award className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger className="flex items-center gap-2" value="leave">
                <Users className="h-4 w-4" />
                Leave Balance
              </TabsTrigger>
            </TabsList>

            <TabsContent className="mt-6" value="overview">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Today's Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">Status</span>
                        <Badge className="bg-green-500">Present</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">Check In</span>
                        <span className="font-medium">09:00 AM</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">
                          Hours Worked
                        </span>
                        <span className="font-medium">6h 30m</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">Location</span>
                        <span className="font-medium">
                          Office - Main Building
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>This Week</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">
                          Days Present
                        </span>
                        <span className="font-medium">4 / 5</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">
                          Total Hours
                        </span>
                        <span className="font-medium">34h 15m</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">Overtime</span>
                        <span className="font-medium">2h 15m</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">
                          Attendance Rate
                        </span>
                        <span className="font-medium text-green-600">80%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>This Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">
                          Days Present
                        </span>
                        <span className="font-medium">18 / 22</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">
                          Total Hours
                        </span>
                        <span className="font-medium">153h 45m</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">Overtime</span>
                        <span className="font-medium">12h 45m</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">
                          Attendance Rate
                        </span>
                        <span className="font-medium text-green-600">82%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">Checked In</div>
                          <div className="text-gray-500 text-xs">
                            Today, 9:00 AM
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            Leave Request
                          </div>
                          <div className="text-gray-500 text-xs">
                            Jan 25-26 - Approved
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            Late Arrival
                          </div>
                          <div className="text-gray-500 text-xs">
                            Jan 14 - 9:15 AM
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent className="mt-6" value="calendar">
              <AttendanceCalendarView />
            </TabsContent>

            <TabsContent className="mt-6" value="history">
              <AttendanceHistoryView />
            </TabsContent>

            <TabsContent className="mt-6" value="analytics">
              <AnalyticsView />
            </TabsContent>

            <TabsContent className="mt-6" value="leave">
              <LeaveBalanceView />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
