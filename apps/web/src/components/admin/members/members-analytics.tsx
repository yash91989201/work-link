import {
  Activity,
  AlertTriangle,
  BarChart3,
  Download,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock analytics data
const membersAnalyticsData = {
  overview: {
    totalGrowthRate: 12.5,
    newMembersThisMonth: 23,
    churnRate: 2.3,
    avgEngagementScore: 78.4,
    activePercentage: 81,
    avgTeamSize: 8.5,
    promotionRate: 15.2,
    satisfactionScore: 4.2,
  },
  monthlyGrowth: [
    { month: "Jan", members: 180, new: 12, left: 3 },
    { month: "Feb", members: 195, new: 18, left: 3 },
    { month: "Mar", members: 210, new: 22, left: 7 },
    { month: "Apr", members: 225, new: 20, left: 5 },
    { month: "May", members: 240, new: 19, left: 4 },
    { month: "Jun", members: 245, new: 23, left: 18 },
  ],
  departmentPerformance: [
    {
      department: "Engineering",
      members: 45,
      growth: 15,
      engagement: 92,
      satisfaction: 4.5,
      turnover: 1.2,
    },
    {
      department: "Design",
      members: 20,
      growth: 8,
      engagement: 88,
      satisfaction: 4.3,
      turnover: 2.1,
    },
    {
      department: "Marketing",
      members: 25,
      growth: -5,
      engagement: 75,
      satisfaction: 3.8,
      turnover: 3.5,
    },
    {
      department: "Sales",
      members: 30,
      growth: 12,
      engagement: 82,
      satisfaction: 4.1,
      turnover: 2.8,
    },
  ],
  engagementTrends: [
    { week: "Week 1", score: 82 },
    { week: "Week 2", score: 78 },
    { week: "Week 3", score: 85 },
    { week: "Week 4", score: 76 },
  ],
  topDepartments: [
    { name: "Engineering", score: 92, trend: "up" },
    { name: "Design", score: 88, trend: "up" },
    { name: "Sales", score: 82, trend: "stable" },
    { name: "Operations", score: 79, trend: "down" },
    { name: "Marketing", score: 75, trend: "down" },
  ],
  atRiskMembers: [
    {
      name: "John Smith",
      email: "john@example.com",
      department: "Marketing",
      lastActive: "2 weeks ago",
      engagementScore: 35,
      riskFactors: ["Low engagement", "No recent activity"],
    },
    {
      name: "Carol White",
      email: "carol@example.com",
      department: "Design",
      lastActive: "1 month ago",
      engagementScore: 42,
      riskFactors: ["Low engagement", "Extended inactivity"],
    },
  ],
};

// Metric Card Component
const AnalyticsMetricCard = ({
  title,
  value,
  change,
  icon: Icon,
  description,
  format = "number",
}: {
  title: string;
  value: string | number;
  change?: number;
  icon: any;
  description?: string;
  format?: "number" | "percentage" | "rating";
}) => {
  const formatValue = () => {
    if (format === "percentage") return `${value}%`;
    if (format === "rating") return `${value}/5`;
    return value;
  };

  const getTrendIcon = () => {
    if (!change) return null;
    if (change > 0) return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-3 w-3 text-red-600" />;
    return <div className="h-3 w-3 rounded-full bg-gray-400" />;
  };

  const getTrendColor = () => {
    if (!change) return "text-muted-foreground";
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="font-bold text-2xl">{formatValue()}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1 text-xs">
            {getTrendIcon()}
            <span className={getTrendColor()}>
              {change > 0 ? "+" : ""}
              {change}%
            </span>
            <span className="text-muted-foreground">from last month</span>
          </div>
        )}
        {description && (
          <p className="mt-1 text-muted-foreground text-xs">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

// Growth Chart Component
const MonthlyGrowthChart = () => {
  const maxMembers = Math.max(
    ...membersAnalyticsData.monthlyGrowth.map((m) => m.members)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Growth</CardTitle>
        <CardDescription>Member count changes over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-bold text-2xl text-green-600">
                +
                {membersAnalyticsData.monthlyGrowth.reduce(
                  (acc, m) => acc + m.new,
                  0
                )}
              </p>
              <p className="text-muted-foreground text-xs">New Members</p>
            </div>
            <div>
              <p className="font-bold text-2xl text-red-600">
                {membersAnalyticsData.monthlyGrowth.reduce(
                  (acc, m) => acc + m.left,
                  0
                )}
              </p>
              <p className="text-muted-foreground text-xs">Departures</p>
            </div>
            <div>
              <p className="font-bold text-2xl">
                {membersAnalyticsData.overview.totalGrowthRate}%
              </p>
              <p className="text-muted-foreground text-xs">Growth Rate</p>
            </div>
          </div>

          <div className="space-y-2">
            {membersAnalyticsData.monthlyGrowth.map((month) => (
              <div className="flex items-center gap-3" key={month.month}>
                <span className="w-12 font-medium text-sm">{month.month}</span>
                <div className="flex-1">
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${(month.members / maxMembers) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="w-12 text-right text-muted-foreground text-sm">
                  {month.members}
                </span>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-green-600">+{month.new}</span>
                  <span className="text-red-600">-{month.left}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Department Performance Table
const DepartmentPerformanceTable = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Performance</CardTitle>
        <CardDescription>Key metrics by department</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {membersAnalyticsData.departmentPerformance.map((dept) => (
            <div
              className="grid grid-cols-6 items-center gap-4 rounded-lg border p-3"
              key={dept.department}
            >
              <div>
                <p className="font-medium text-sm">{dept.department}</p>
                <p className="text-muted-foreground text-xs">
                  {dept.members} members
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  {dept.growth > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span
                    className={`font-medium text-sm ${dept.growth > 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {dept.growth > 0 ? "+" : ""}
                    {dept.growth}%
                  </span>
                </div>
                <p className="text-muted-foreground text-xs">Growth</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-sm">{dept.engagement}%</p>
                <Progress className="h-1" value={dept.engagement} />
                <p className="text-muted-foreground text-xs">Engagement</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-sm">{dept.satisfaction}/5</p>
                <div className="flex justify-center">
                  {[...Array(5)].map((_, i) => (
                    <div
                      className={`mx-0.5 h-1 w-1 rounded-full ${
                        i < Math.floor(dept.satisfaction)
                          ? "bg-yellow-400"
                          : "bg-gray-300"
                      }`}
                      key={i}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground text-xs">Satisfaction</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-sm">{dept.turnover}%</p>
                <p className="text-muted-foreground text-xs">Turnover</p>
              </div>
              <div>
                <Badge variant={dept.growth > 0 ? "default" : "secondary"}>
                  {dept.growth > 0 ? "Growing" : "Declining"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Engagement Trends
const EngagementTrends = () => {
  const avgScore =
    membersAnalyticsData.engagementTrends.reduce(
      (acc, week) => acc + week.score,
      0
    ) / membersAnalyticsData.engagementTrends.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Engagement Trends</CardTitle>
        <CardDescription>
          Member engagement scores over the last 4 weeks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">Average Score</span>
            <span className="font-bold text-2xl">{avgScore.toFixed(1)}%</span>
          </div>
          <div className="space-y-3">
            {membersAnalyticsData.engagementTrends.map((week, index) => (
              <div className="flex items-center gap-3" key={week.week}>
                <span className="w-16 font-medium text-sm">{week.week}</span>
                <div className="flex-1">
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${week.score}%` }}
                    />
                  </div>
                </div>
                <span className="w-12 text-right font-medium text-sm">
                  {week.score}%
                </span>
                {index < membersAnalyticsData.engagementTrends.length - 1 && (
                  <div className="text-muted-foreground text-xs">
                    {membersAnalyticsData.engagementTrends[index + 1].score >
                    week.score ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// At-Risk Members
const AtRiskMembers = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          At-Risk Members
        </CardTitle>
        <CardDescription>Members who may need attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {membersAnalyticsData.atRiskMembers.map((member) => (
            <div
              className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50"
              key={member.email}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback>
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-medium text-sm">{member.name}</p>
                  <Badge className="text-orange-600 text-xs" variant="outline">
                    {member.engagementScore}% engagement
                  </Badge>
                </div>
                <p className="text-muted-foreground text-xs">
                  {member.email} • {member.department}
                </p>
                <p className="text-muted-foreground text-xs">
                  Last active: {member.lastActive}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {member.riskFactors.map((factor, index) => (
                    <Badge className="text-xs" key={index} variant="secondary">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const MembersAnalytics = () => {
  const [timeRange, setTimeRange] = useState("30d");

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-lg">Members Analytics</h3>
          <p className="text-muted-foreground text-sm">
            Comprehensive insights into member performance and engagement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select onValueChange={setTimeRange} value={timeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsMetricCard
          change={2.3}
          description="Monthly member growth"
          format="percentage"
          icon={TrendingUp}
          title="Growth Rate"
          value={membersAnalyticsData.overview.totalGrowthRate}
        />
        <AnalyticsMetricCard
          change={-1.2}
          description="Overall engagement score"
          format="percentage"
          icon={Activity}
          title="Avg Engagement"
          value={membersAnalyticsData.overview.avgEngagementScore}
        />
        <AnalyticsMetricCard
          change={-0.5}
          description="Monthly turnover rate"
          format="percentage"
          icon={Users}
          title="Churn Rate"
          value={membersAnalyticsData.overview.churnRate}
        />
        <AnalyticsMetricCard
          change={0.1}
          description="Average satisfaction rating"
          format="rating"
          icon={Target}
          title="Satisfaction"
          value={membersAnalyticsData.overview.satisfactionScore}
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MonthlyGrowthChart />
        <EngagementTrends />
      </div>

      <DepartmentPerformanceTable />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AtRiskMembers />

        {/* Top Performing Departments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Top Performing Departments
            </CardTitle>
            <CardDescription>
              Best engagement and satisfaction scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {membersAnalyticsData.topDepartments.map((dept, index) => (
                <div
                  className="flex items-center justify-between rounded-lg border p-3"
                  key={dept.name}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-xs">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{dept.name}</p>
                      <p className="text-muted-foreground text-xs">
                        Engagement score
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{dept.score}%</span>
                    {dept.trend === "up" && (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    )}
                    {dept.trend === "down" && (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    {dept.trend === "stable" && (
                      <div className="h-3 w-3 rounded-full bg-gray-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
