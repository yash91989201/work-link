import {
  IconBuilding,
  IconChartBar,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(admin)/dashboard/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Users</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">1,234</div>
            <p className="text-muted-foreground text-xs">
              +10% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Active Teams</CardTitle>
            <IconBuilding className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">42</div>
            <p className="text-muted-foreground text-xs">+3 new this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Growth Rate</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">15.3%</div>
            <p className="text-muted-foreground text-xs">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Analytics</CardTitle>
            <IconChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">8.2k</div>
            <p className="text-muted-foreground text-xs">+257 from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 font-semibold text-lg">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="cursor-pointer transition-colors hover:bg-accent/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconUsers className="h-5 w-5" />
                Manage Teams
              </CardTitle>
              <CardDescription>
                Create and manage organization teams
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="cursor-pointer transition-colors hover:bg-accent/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconBuilding className="h-5 w-5" />
                Organization Settings
              </CardTitle>
              <CardDescription>Configure organization details</CardDescription>
            </CardHeader>
          </Card>
          <Card className="cursor-pointer transition-colors hover:bg-accent/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconChartBar className="h-5 w-5" />
                View Analytics
              </CardTitle>
              <CardDescription>Track organization performance</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="mb-4 font-semibold text-lg">Recent Activity</h2>
        <Card>
          <CardHeader>
            <CardTitle>Activity Feed</CardTitle>
            <CardDescription>
              Latest activities across your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="font-medium text-sm">New team created</p>
                  <p className="text-muted-foreground text-xs">
                    Engineering Team - 2 hours ago
                  </p>
                </div>
                <Badge variant="secondary">Team</Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="font-medium text-sm">New user joined</p>
                  <p className="text-muted-foreground text-xs">
                    Sarah Chen - 5 hours ago
                  </p>
                </div>
                <Badge variant="secondary">User</Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Settings updated</p>
                  <p className="text-muted-foreground text-xs">
                    Organization settings - 1 day ago
                  </p>
                </div>
                <Badge variant="secondary">Settings</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
