import { useParams } from "@tanstack/react-router";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Download,
  Mail,
  RefreshCw,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityFeed } from "./activity-feed";
import { AnalyticsOverview } from "./analytics-overview";
import { ReportsOverview } from "./reports-overview";

// Mock data for dashboard
const dashboardStats = {
  overview: {
    totalMembers: 245,
    activeMembers: 198,
    totalTeams: 12,
    activeTeams: 10,
    openInvites: 8,
    pendingApprovals: 3,
    monthlyGrowth: 12.5,
    engagementRate: 78.4,
  },
  recentActivity: [
    {
      id: "1",
      type: "member_joined",
      title: "New member joined",
      description: "Sarah Johnson joined the Engineering team",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      icon: UserPlus,
      color: "text-green-600",
    },
    {
      id: "2",
      type: "team_created",
      title: "New team created",
      description: "Product Marketing team was created",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      icon: Building2,
      color: "text-blue-600",
    },
    {
      id: "3",
      type: "invitation_sent",
      title: "Invitations sent",
      description: "5 invitations sent to Design team",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      icon: Mail,
      color: "text-yellow-600",
    },
    {
      id: "4",
      type: "member_active",
      title: "High activity detected",
      description: "Engineering team showed 95% activity",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      icon: Activity,
      color: "text-purple-600",
    },
  ],
  teamPerformance: [
    {
      id: "1",
      name: "Engineering",
      members: 12,
      activeMembers: 11,
      performance: 92,
      trend: "up",
      projects: 8,
    },
    {
      id: "2",
      name: "Design",
      members: 6,
      activeMembers: 5,
      performance: 88,
      trend: "up",
      projects: 4,
    },
    {
      id: "3",
      name: "Marketing",
      members: 8,
      activeMembers: 6,
      performance: 75,
      trend: "down",
      projects: 6,
    },
    {
      id: "4",
      name: "Sales",
      members: 10,
      activeMembers: 7,
      performance: 68,
      trend: "stable",
      projects: 5,
    },
  ],
  upcomingEvents: [
    {
      id: "1",
      title: "Team Sync Meeting",
      date: new Date(Date.now() + 2 * 60 * 60 * 1000),
      type: "meeting",
      attendees: 12,
    },
    {
      id: "2",
      title: "Project Review",
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      type: "review",
      attendees: 8,
    },
    {
      id: "3",
      title: "Team Building Event",
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      type: "event",
      attendees: 25,
    },
  ],
};

// Stats Card Component
const DashboardStatsCard = ({
  title,
  value,
  change,
  icon: Icon,
  description,
  trend,
  color = "default",
}: {
  title: string;
  value: string | number;
  change?: number;
  icon: any;
  description?: string;
  trend?: "up" | "down" | "stable";
  color?: "default" | "success" | "warning" | "danger";
}) => {
  const getTrendIcon = () => {
    if (trend === "up")
      return <ArrowUpRight className="h-3 w-3 text-green-600" />;
    if (trend === "down")
      return <ArrowDownRight className="h-3 w-3 text-red-600" />;
    return <div className="h-3 w-3 rounded-full bg-gray-400" />;
  };

  const getColorClasses = () => {
    switch (color) {
      case "success":
        return "border-green-200 bg-green-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "danger":
        return "border-red-200 bg-red-50";
      default:
        return "";
    }
  };

  return (
    <Card className={getColorClasses()}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="font-bold text-2xl">{value}</div>
        {(change !== undefined || trend) && (
          <div className="flex items-center gap-1 text-xs">
            {getTrendIcon()}
            {change !== undefined && (
              <span className={change >= 0 ? "text-green-600" : "text-red-600"}>
                {change >= 0 ? "+" : ""}
                {change}%
              </span>
            )}
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

// Activity Item Component
const ActivityItem = ({ activity }: { activity: any }) => {
  const Icon = activity.icon;

  return (
    <div className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50">
      <div className={`rounded-full bg-muted p-2 ${activity.color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm">{activity.title}</p>
        <p className="text-muted-foreground text-xs">{activity.description}</p>
        <p className="mt-1 text-muted-foreground text-xs">
          {activity.timestamp.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

// Team Performance Component
const TeamPerformanceCard = ({ team }: { team: any }) => {
  const getTrendIcon = () => {
    if (team.trend === "up")
      return <ArrowUpRight className="h-3 w-3 text-green-600" />;
    if (team.trend === "down")
      return <ArrowDownRight className="h-3 w-3 text-red-600" />;
    return <div className="h-3 w-3 rounded-full bg-gray-400" />;
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-medium">{team.name}</h4>
          {getTrendIcon()}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Performance</span>
            <span className="font-medium">{team.performance}%</span>
          </div>
          <Progress className="h-2" value={team.performance} />
          <div className="flex justify-between text-muted-foreground text-xs">
            <span>
              {team.activeMembers}/{team.members} active
            </span>
            <span>{team.projects} projects</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Chart Components
const EngagementChart = () => {
  const data = [
    { name: "Mon", value: 85 },
    { name: "Tue", value: 78 },
    { name: "Wed", value: 92 },
    { name: "Thu", value: 88 },
    { name: "Fri", value: 75 },
    { name: "Sat", value: 45 },
    { name: "Sun", value: 30 },
  ];

  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Engagement</CardTitle>
        <CardDescription>Team activity throughout the week</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item) => (
            <div className="flex items-center gap-3" key={item.name}>
              <span className="w-8 font-medium text-sm">{item.name}</span>
              <div className="flex-1">
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div
                    className="h-2 rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                  />
                </div>
              </div>
              <span className="w-8 text-right text-muted-foreground text-sm">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const DepartmentDistribution = () => {
  const departments = [
    { name: "Engineering", count: 45, color: "bg-blue-500" },
    { name: "Design", count: 20, color: "bg-green-500" },
    { name: "Marketing", count: 25, color: "bg-yellow-500" },
    { name: "Sales", count: 30, color: "bg-purple-500" },
    { name: "Operations", count: 15, color: "bg-red-500" },
  ];

  const total = departments.reduce((sum, dept) => sum + dept.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Distribution</CardTitle>
        <CardDescription>Members across departments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {departments.map((dept) => (
            <div className="flex items-center justify-between" key={dept.name}>
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${dept.color}`} />
                <span className="font-medium text-sm">{dept.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 rounded-full bg-secondary">
                  <div
                    className={`${dept.color} h-2 rounded-full`}
                    style={{ width: `${(dept.count / total) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-muted-foreground text-sm">
                  {dept.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Dashboard Component
export const AdminDashboard = () => {
  const { slug } = useParams({
    from: "/(authenticated)/org/$slug/(admin)/dashboard",
  });
  const [timeRange, setTimeRange] = useState("7d");

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/org/${slug}/dashboard`}>
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="mt-2 font-bold text-2xl">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening in your organization.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select onValueChange={setTimeRange} value={timeRange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button size="sm" variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs className="space-y-6" defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent className="space-y-6" value="overview">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <DashboardStatsCard
                change={12.5}
                color="success"
                icon={Users}
                title="Total Members"
                trend="up"
                value={dashboardStats.overview.totalMembers}
              />
              <DashboardStatsCard
                change={8.2}
                color="success"
                icon={Building2}
                title="Active Teams"
                trend="up"
                value={dashboardStats.overview.activeTeams}
              />
              <DashboardStatsCard
                change={-2.1}
                color="warning"
                icon={Activity}
                title="Engagement Rate"
                trend="down"
                value={`${dashboardStats.overview.engagementRate}%`}
              />
              <DashboardStatsCard
                color="default"
                description="Pending approvals"
                icon={Mail}
                title="Open Invites"
                value={dashboardStats.overview.openInvites}
              />
            </div>

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Engagement Chart */}
              <div className="lg:col-span-2">
                <EngagementChart />
              </div>

              {/* Department Distribution */}
              <DepartmentDistribution />
            </div>

            {/* Activity Feed */}
            <ActivityFeed />
          </TabsContent>

          <TabsContent className="space-y-6" value="analytics">
            <AnalyticsOverview />
          </TabsContent>

          <TabsContent className="space-y-6" value="reports">
            <ReportsOverview />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

