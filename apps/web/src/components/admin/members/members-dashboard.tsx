import { useParams } from "@tanstack/react-router";
import {
  Activity,
  CheckCircle,
  Download,
  Edit,
  Filter,
  Mail,
  MessageSquare,
  MoreHorizontal,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { InvitationListTable } from "@/components/admin/invitation-list-table";
import { InviteMemberDialog } from "@/components/admin/members/invite-member-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InviteMemberForm } from "./invite-member-form";
import { MembersAnalytics } from "./members-analytics";

// Mock data for members dashboard
const membersStats = {
  overview: {
    totalMembers: 245,
    activeMembers: 198,
    newThisMonth: 23,
    pendingInvitations: 8,
    avgEngagement: 78.4,
    teamsCount: 12,
    departments: 5,
  },
  departmentBreakdown: [
    { name: "Engineering", count: 45, percentage: 18.4 },
    { name: "Design", count: 20, percentage: 8.2 },
    { name: "Marketing", count: 25, percentage: 10.2 },
    { name: "Sales", count: 30, percentage: 12.2 },
    { name: "Operations", count: 15, percentage: 6.1 },
    { name: "Customer Support", count: 35, percentage: 14.3 },
    { name: "Product", count: 18, percentage: 7.3 },
    { name: "HR", count: 12, percentage: 4.9 },
    { name: "Finance", count: 10, percentage: 4.1 },
    { name: "Legal", count: 8, percentage: 3.3 },
    { name: "Other", count: 27, percentage: 11.0 },
  ],
  roleDistribution: [
    { role: "Admin", count: 5, color: "bg-red-500" },
    { role: "Manager", count: 15, color: "bg-blue-500" },
    { role: "Team Lead", count: 20, color: "bg-green-500" },
    { role: "Senior Member", count: 60, color: "bg-purple-500" },
    { role: "Member", count: 145, color: "bg-gray-500" },
  ],
  recentActivity: [
    {
      id: "1",
      type: "member_joined",
      user: "Alice Johnson",
      email: "alice@example.com",
      team: "Engineering",
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      avatar: "",
    },
    {
      id: "2",
      type: "role_changed",
      user: "Bob Smith",
      email: "bob@example.com",
      team: "Marketing",
      date: new Date(Date.now() - 4 * 60 * 60 * 1000),
      avatar: "",
      oldRole: "Member",
      newRole: "Team Lead",
    },
    {
      id: "3",
      type: "member_left",
      user: "Carol White",
      email: "carol@example.com",
      team: "Design",
      date: new Date(Date.now() - 8 * 60 * 60 * 1000),
      avatar: "",
    },
    {
      id: "4",
      type: "invitation_accepted",
      user: "David Brown",
      email: "david@example.com",
      team: "Sales",
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      avatar: "",
    },
  ],
  topPerformers: [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      team: "Engineering",
      role: "Team Lead",
      performance: 95,
      projects: 12,
      avatar: "",
    },
    {
      id: "2",
      name: "Mike Chen",
      email: "mike@example.com",
      team: "Design",
      role: "Senior Designer",
      performance: 92,
      projects: 8,
      avatar: "",
    },
    {
      id: "3",
      name: "Emily Davis",
      email: "emily@example.com",
      team: "Marketing",
      role: "Marketing Manager",
      performance: 88,
      projects: 10,
      avatar: "",
    },
    {
      id: "4",
      name: "John Smith",
      email: "john@example.com",
      team: "Sales",
      role: "Sales Lead",
      performance: 86,
      projects: 15,
      avatar: "",
    },
  ],
};

// Member table mock data
const mockMembers = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    role: "Team Lead",
    team: "Engineering",
    department: "Engineering",
    status: "active",
    joinDate: new Date("2024-01-15"),
    lastActive: new Date(),
    engagement: 95,
    avatar: "",
  },
  {
    id: "2",
    name: "Mike Chen",
    email: "mike@example.com",
    role: "Senior Designer",
    team: "Design",
    department: "Design",
    status: "active",
    joinDate: new Date("2024-02-20"),
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    engagement: 88,
    avatar: "",
  },
  {
    id: "3",
    name: "Emily Davis",
    email: "emily@example.com",
    role: "Marketing Manager",
    team: "Marketing",
    department: "Marketing",
    status: "active",
    joinDate: new Date("2024-03-10"),
    lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000),
    engagement: 92,
    avatar: "",
  },
  {
    id: "4",
    name: "John Smith",
    email: "john@example.com",
    role: "Sales Lead",
    team: "Sales",
    department: "Sales",
    status: "inactive",
    joinDate: new Date("2023-12-01"),
    lastActive: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    engagement: 65,
    avatar: "",
  },
];

// Stats Card Component
const MemberStatsCard = ({
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
      return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (trend === "down")
      return <TrendingDown className="h-3 w-3 text-red-600" />;
    return <div className="h-3 w-3 rounded-full bg-gray-400" />;
  };

  const getColorClasses = () => {
    switch (color) {
      case "success":
        return "border-green-200 bg-green-50 text-green-500";
      case "warning":
        return "border-yellow-200 bg-yellow-50 text-yellow-500";
      case "danger":
        return "border-red-200 bg-red-50 text-red-500";
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
                {change}
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

// Department Breakdown Component
const DepartmentBreakdown = () => (
  <Card>
    <CardHeader>
      <CardTitle>Department Breakdown</CardTitle>
      <CardDescription>Members distribution across departments</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {membersStats.departmentBreakdown.map((dept) => (
          <div className="flex items-center justify-between" key={dept.name}>
            <span className="font-medium text-sm">{dept.name}</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-20 rounded-full bg-secondary">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${(dept.percentage / 20) * 100}%` }}
                />
              </div>
              <span className="w-12 text-right text-muted-foreground text-sm">
                {dept.count}
              </span>
              <span className="w-8 text-right text-muted-foreground text-xs">
                {dept.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Role Distribution Component
const RoleDistribution = () => (
  <Card>
    <CardHeader>
      <CardTitle>Role Distribution</CardTitle>
      <CardDescription>Members by role type</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {membersStats.roleDistribution.map((role) => (
          <div className="flex items-center justify-between" key={role.role}>
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${role.color}`} />
              <span className="font-medium text-sm">{role.role}</span>
            </div>
            <span className="text-muted-foreground text-sm">{role.count}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Member Activity Component
const MemberActivity = ({ activity }: { activity: any }) => {
  const getActivityIcon = () => {
    switch (activity.type) {
      case "member_joined":
        return <UserPlus className="h-4 w-4 text-green-600" />;
      case "role_changed":
        return <Settings className="h-4 w-4 text-blue-600" />;
      case "member_left":
        return <Users className="h-4 w-4 text-red-600" />;
      case "invitation_accepted":
        return <CheckCircle className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50">
      <div className="rounded-full bg-muted p-2">{getActivityIcon()}</div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm">
          {activity.type === "member_joined" &&
            `${activity.user} joined ${activity.team}`}
          {activity.type === "role_changed" &&
            `${activity.user}'s role changed to ${activity.newRole}`}
          {activity.type === "member_left" &&
            `${activity.user} left ${activity.team}`}
          {activity.type === "invitation_accepted" &&
            `${activity.user} accepted invitation to ${activity.team}`}
        </p>
        <p className="text-muted-foreground text-xs">{activity.email}</p>
        <p className="mt-1 text-muted-foreground text-xs">
          {activity.date.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

// Top Performer Card
const TopPerformerCard = ({ performer }: { performer: any }) => (
  <Card className="transition-shadow hover:shadow-md">
    <CardContent className="p-4">
      <div className="mb-3 flex items-center gap-3">
        <Avatar>
          <AvatarImage src={performer.avatar} />
          <AvatarFallback>
            {performer.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-medium text-sm">{performer.name}</p>
          <p className="text-muted-foreground text-xs">{performer.role}</p>
        </div>
        <Badge className="text-xs" variant="outline">
          {performer.performance}%
        </Badge>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Performance</span>
          <span className="font-medium">{performer.performance}%</span>
        </div>
        <Progress className="h-1" value={performer.performance} />
        <div className="flex justify-between text-muted-foreground text-xs">
          <span>{performer.team}</span>
          <span>{performer.projects} projects</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Main Members Dashboard Component
export const MembersDashboard = () => {
  const { slug } = useParams({
    from: "/(authenticated)/org/$slug/(admin)/dashboard/members/",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentTab, setCurrentTab] = useState("overview");

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
                  <BreadcrumbPage>Members</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="mt-2 font-bold text-2xl">Members Management</h1>
            <p className="text-muted-foreground">
              Manage organization members, invitations, and roles
            </p>
          </div>
          <div className="flex items-center gap-2">
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
      <div className="flex-1 overflow-auto">
        <Tabs
          className="h-full"
          onValueChange={setCurrentTab}
          value={currentTab}
        >
          <div className="border-b p-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="members">All Members</TabsTrigger>
              <TabsTrigger value="invitations">Invitations</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent className="space-y-6" value="overview">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MemberStatsCard
                  change={12}
                  color="warning"
                  icon={Users}
                  title="Total Members"
                  trend="up"
                  value={membersStats.overview.totalMembers}
                />
                <MemberStatsCard
                  change={8}
                  color="success"
                  icon={Activity}
                  title="Active Members"
                  trend="up"
                  value={membersStats.overview.activeMembers}
                />
                <MemberStatsCard
                  change={23}
                  color="success"
                  icon={UserPlus}
                  title="New This Month"
                  trend="up"
                  value={membersStats.overview.newThisMonth}
                />
                <MemberStatsCard
                  color="warning"
                  description="Awaiting response"
                  icon={Mail}
                  title="Pending Invitations"
                  value={membersStats.overview.pendingInvitations}
                />
              </div>

              {/* Department and Role Breakdown */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <DepartmentBreakdown />
                <RoleDistribution />
              </div>

              {/* Recent Activity and Top Performers */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest member updates</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {membersStats.recentActivity.map((activity) => (
                      <MemberActivity activity={activity} key={activity.id} />
                    ))}
                  </CardContent>
                </Card>

                {/* Top Performers */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performers</CardTitle>
                    <CardDescription>
                      Members with highest engagement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-3">
                      {membersStats.topPerformers
                        .slice(0, 4)
                        .map((performer) => (
                          <TopPerformerCard
                            key={performer.id}
                            performer={performer}
                          />
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Invite */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Invite</CardTitle>
                  <CardDescription>
                    Send invitation to new members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border-2 border-muted border-dashed p-6 text-center">
                    <UserPlus className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 font-medium text-lg">
                      Invite New Members
                    </h3>
                    <p className="mb-4 text-muted-foreground text-sm">
                      Send invitations via email or share invitation links
                    </p>
                    <InviteMemberDialog>
                      <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Send Invitation
                      </Button>
                    </InviteMemberDialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent className="space-y-6" value="members">
              {/* Search and Filters */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-1 items-center gap-3">
                  <div className="relative max-w-sm flex-1">
                    <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
                    <Input
                      className="pl-10"
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search members..."
                      value={searchTerm}
                    />
                  </div>
                  <Select onValueChange={setRoleFilter} value={roleFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="team-lead">Team Lead</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select onValueChange={setStatusFilter} value={statusFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    More Filters
                  </Button>
                  <InviteMemberDialog>
                    <Button>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Invite Member
                    </Button>
                  </InviteMemberDialog>
                </div>
              </div>

              {/* Members Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Engagement</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="w-[50px]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback>
                                  {member.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-muted-foreground text-sm">
                                  {member.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{member.role}</Badge>
                          </TableCell>
                          <TableCell>{member.team}</TableCell>
                          <TableCell>{member.department}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                member.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {member.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-12 rounded-full bg-secondary">
                                <div
                                  className="h-2 rounded-full bg-primary"
                                  style={{ width: `${member.engagement}%` }}
                                />
                              </div>
                              <span className="text-sm">
                                {member.engagement}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {member.joinDate.toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  Message
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Settings className="mr-2 h-4 w-4" />
                                  Change Role
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent className="space-y-6" value="invitations">
              <Card>
                <CardHeader>
                  <CardTitle>Pending & Recent Invitations</CardTitle>
                  <CardDescription>
                    Manage member invitations and track status
                  </CardDescription>
                  <InviteMemberForm />
                </CardHeader>
                <CardContent>
                  <InvitationListTable />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent className="space-y-6" value="analytics">
              <MembersAnalytics />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
