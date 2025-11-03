"use client";

import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle,
  MoreHorizontal,
  TrendingDown,
  TrendingUp,
  UserMinus,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data for analytics
const analyticsData = {
  growthMetrics: {
    newMembers: 23,
    churnRate: 2.3,
    retentionRate: 97.7,
    avgTeamSize: 8.5,
    productivityScore: 78,
  },
  teamMetrics: [
    {
      id: "1",
      name: "Engineering",
      members: 12,
      projects: 8,
      completionRate: 85,
      satisfaction: 92,
      growth: 15,
    },
    {
      id: "2",
      name: "Design",
      members: 6,
      projects: 4,
      completionRate: 90,
      satisfaction: 88,
      growth: 8,
    },
    {
      id: "3",
      name: "Marketing",
      members: 8,
      projects: 6,
      completionRate: 72,
      satisfaction: 75,
      growth: -5,
    },
    {
      id: "4",
      name: "Sales",
      members: 10,
      projects: 5,
      completionRate: 68,
      satisfaction: 70,
      growth: 12,
    },
  ],
  recentChanges: [
    {
      id: "1",
      type: "member_joined",
      member: "Alice Johnson",
      team: "Engineering",
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      avatar: "",
    },
    {
      id: "2",
      type: "member_left",
      member: "Bob Smith",
      team: "Marketing",
      date: new Date(Date.now() - 6 * 60 * 60 * 1000),
      avatar: "",
    },
    {
      id: "3",
      type: "team_created",
      team: "Product Innovation",
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: "4",
      type: "member_joined",
      member: "Carol White",
      team: "Design",
      date: new Date(Date.now() - 48 * 60 * 60 * 1000),
      avatar: "",
    },
  ],
  alerts: [
    {
      id: "1",
      type: "warning",
      title: "Low Engagement in Marketing",
      description: "Marketing team engagement dropped below 70%",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      id: "2",
      type: "success",
      title: "Engineering Team Milestone",
      description: "Completed 10 projects this month",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "3",
      type: "error",
      title: "Pending Approvals",
      description: "3 team invitations pending approval",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
  ],
};

// Metric Card Component
const MetricCard = ({
  title,
  value,
  change,
  unit = "",
  description,
  trend,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  change?: number;
  unit?: string;
  description?: string;
  trend?: "up" | "down" | "stable";
  icon: any;
}) => {
  const getTrendColor = () => {
    if (trend === "up") return "text-green-600";
    if (trend === "down") return "text-red-600";
    return "text-gray-600";
  };

  const getTrendIcon = () => {
    if (trend === "up") return <ArrowUpRight className="h-3 w-3" />;
    if (trend === "down") return <ArrowDownRight className="h-3 w-3" />;
    return <div className="h-3 w-3 rounded-full bg-gray-400" />;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="font-bold text-2xl">
          {value}
          {unit}
        </div>
        {(change !== undefined || trend) && (
          <div className="flex items-center gap-1 text-xs">
            {getTrendIcon()}
            <span className={getTrendColor()}>
              {change !== undefined && (change >= 0 ? "+" : "")}
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

// Change Item Component
const ChangeItem = ({ change }: { change: any }) => {
  const getIcon = () => {
    switch (change.type) {
      case "member_joined":
        return <UserPlus className="h-4 w-4 text-green-600" />;
      case "member_left":
        return <UserMinus className="h-4 w-4 text-red-600" />;
      case "team_created":
        return <Users className="h-4 w-4 text-blue-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted/50">
      {getIcon()}
      <div className="flex-1">
        <p className="font-medium text-sm">
          {change.type === "member_joined" &&
            `${change.member} joined ${change.team}`}
          {change.type === "member_left" &&
            `${change.member} left ${change.team}`}
          {change.type === "team_created" && `${change.team} team was created`}
        </p>
        <p className="text-muted-foreground text-xs">
          {change.date.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

// Alert Item Component
const AlertItem = ({ alert }: { alert: any }) => {
  const getIcon = () => {
    switch (alert.type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getBadgeVariant = () => {
    switch (alert.type) {
      case "warning":
        return "destructive" as const;
      case "success":
        return "default" as const;
      case "error":
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      {getIcon()}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <p className="font-medium text-sm">{alert.title}</p>
          <Badge className="text-xs" variant={getBadgeVariant()}>
            {alert.type}
          </Badge>
        </div>
        <p className="text-muted-foreground text-xs">{alert.description}</p>
        <p className="mt-1 text-muted-foreground text-xs">
          {alert.timestamp.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export const AnalyticsOverview = () => {
  return (
    <div className="space-y-6">
      {/* Growth Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          change={15}
          description="This month"
          icon={UserPlus}
          title="New Members"
          trend="up"
          value={analyticsData.growthMetrics.newMembers}
        />
        <MetricCard
          change={-0.5}
          description="Monthly churn"
          icon={UserMinus}
          title="Churn Rate"
          trend="down"
          unit="%"
          value={analyticsData.growthMetrics.churnRate}
        />
        <MetricCard
          change={0.3}
          description="Member retention"
          icon={Users}
          title="Retention Rate"
          trend="up"
          unit="%"
          value={analyticsData.growthMetrics.retentionRate}
        />
        <MetricCard
          change={5.2}
          description="Overall productivity"
          icon={TrendingUp}
          title="Productivity Score"
          trend="up"
          unit=""
          value={analyticsData.growthMetrics.productivityScore}
        />
      </div>

      {/* Team Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance Analytics</CardTitle>
          <CardDescription>Detailed metrics for each team</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Completion Rate</TableHead>
                <TableHead>Satisfaction</TableHead>
                <TableHead>Growth</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {analyticsData.teamMetrics.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>{team.members}</TableCell>
                  <TableCell>{team.projects}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-12 rounded-full bg-secondary">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${team.completionRate}%` }}
                        />
                      </div>
                      <span className="text-sm">{team.completionRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-12 rounded-full bg-secondary">
                        <div
                          className="h-2 rounded-full bg-green-500"
                          style={{ width: `${team.satisfaction}%` }}
                        />
                      </div>
                      <span className="text-sm">{team.satisfaction}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {team.growth > 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span
                        className={`text-sm ${team.growth > 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {team.growth > 0 ? "+" : ""}
                        {team.growth}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Export Report</DropdownMenuItem>
                        <DropdownMenuItem>Set Alert</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Changes and Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Changes */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Changes</CardTitle>
            <CardDescription>Latest organizational changes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {analyticsData.recentChanges.map((change) => (
              <ChangeItem change={change} key={change.id} />
            ))}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>
              Important notifications and warnings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analyticsData.alerts.map((alert) => (
              <AlertItem alert={alert} key={alert.id} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

