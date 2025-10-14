"use client";

import { useParams } from "@tanstack/react-router";
import {
  Building2,
  CheckCircle,
  Clock,
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
  UserCheck,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateTeamForm } from "./team/create-team-form";

// Mock data types
interface Team {
  id: string;
  name: string;
  organizationId: string;
  memberCount: number;
  activeMembers: number;
  createdAt: Date;
  status: "active" | "inactive" | "archived";
  description?: string;
  leadId?: string;
  leadName?: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: Date;
  lastActive: Date;
  status: "active" | "inactive";
}

interface Invitation {
  id: string;
  email: string;
  teamName: string;
  status: "pending" | "accepted" | "expired";
  createdAt: Date;
  expiresAt: Date;
  inviterName: string;
}

// Mock data
const mockTeams: Team[] = [
  {
    id: "team-1",
    name: "Engineering",
    organizationId: "org-1",
    memberCount: 12,
    activeMembers: 10,
    createdAt: new Date("2024-01-15"),
    status: "active",
    description: "Core product development team",
    leadId: "user-1",
    leadName: "Sarah Johnson",
  },
  {
    id: "team-2",
    name: "Design",
    organizationId: "org-1",
    memberCount: 6,
    activeMembers: 5,
    createdAt: new Date("2024-02-20"),
    status: "active",
    description: "UI/UX and product design",
    leadId: "user-2",
    leadName: "Mike Chen",
  },
  {
    id: "team-3",
    name: "Marketing",
    organizationId: "org-1",
    memberCount: 8,
    activeMembers: 6,
    createdAt: new Date("2024-03-10"),
    status: "active",
    description: "Marketing and growth team",
    leadName: "Emily Davis",
  },
  {
    id: "team-4",
    name: "Sales",
    organizationId: "org-1",
    memberCount: 10,
    activeMembers: 7,
    createdAt: new Date("2024-01-25"),
    status: "inactive",
    description: "Sales and business development",
    leadName: "John Smith",
  },
];

const mockTeamMembers: TeamMember[] = [
  {
    id: "user-1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    role: "Team Lead",
    joinedAt: new Date("2024-01-15"),
    lastActive: new Date(),
    status: "active",
  },
  {
    id: "user-2",
    name: "Mike Chen",
    email: "mike@example.com",
    role: "Senior Designer",
    joinedAt: new Date("2024-02-20"),
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: "active",
  },
];

const mockInvitations: Invitation[] = [
  {
    id: "inv-1",
    email: "new.user@example.com",
    teamName: "Engineering",
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    inviterName: "Sarah Johnson",
  },
  {
    id: "inv-2",
    email: "designer.candidate@example.com",
    teamName: "Design",
    status: "pending",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    inviterName: "Mike Chen",
  },
];

// Stats Card Component
const StatsCard = ({
  title,
  value,
  change,
  icon: Icon,
  description,
}: {
  title: string;
  value: string | number;
  change?: number;
  icon: any;
  description?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="font-medium text-sm">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="font-bold text-2xl">{value}</div>
      {change !== undefined && (
        <p
          className={`text-xs ${change >= 0 ? "text-green-600" : "text-red-600"}`}
        >
          {change >= 0 ? "+" : ""}
          {change}% from last month
        </p>
      )}
      {description && (
        <p className="mt-1 text-muted-foreground text-xs">{description}</p>
      )}
    </CardContent>
  </Card>
);

// Chart Components
const TeamSizeChart = () => {
  const data = [
    { range: "1-5", count: 2 },
    { range: "6-10", count: 1 },
    { range: "11-15", count: 1 },
    { range: "16-20", count: 0 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Size Distribution</CardTitle>
        <CardDescription>Number of teams by member count</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item) => (
            <div className="flex items-center justify-between" key={item.range}>
              <span className="font-medium text-sm">{item.range} members</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-32 rounded-full bg-secondary">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${(item.count / 4) * 100}%` }}
                  />
                </div>
                <span className="w-4 text-muted-foreground text-sm">
                  {item.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ActivityChart = () => {
  const data = [
    { type: "Team Created", count: 35, color: "bg-blue-500" },
    { type: "Member Added", count: 28, color: "bg-green-500" },
    { type: "Invitation Sent", count: 20, color: "bg-yellow-500" },
    { type: "Team Archived", count: 5, color: "bg-red-500" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Activity types in the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item) => (
            <div className="flex items-center justify-between" key={item.type}>
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${item.color}`} />
                <span className="text-sm">{item.type}</span>
              </div>
              <span className="font-medium text-sm">{item.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Team Detail Panel
const TeamDetailPanel = ({
  team,
  isOpen,
  onClose,
}: {
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!team) return null;

  return (
    <Sheet onOpenChange={onClose} open={isOpen}>
      <SheetContent className="w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            {team.name}
            <Button onClick={onClose} size="sm" variant="ghost">
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">Status</span>
            <Badge variant={team.status === "active" ? "default" : "secondary"}>
              {team.status}
            </Badge>
          </div>

          {/* Description */}
          {team.description && (
            <div>
              <span className="font-medium text-sm">Description</span>
              <p className="mt-1 text-muted-foreground text-sm">
                {team.description}
              </p>
            </div>
          )}

          {/* Team Lead */}
          {team.leadName && (
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">Team Lead</span>
              <span className="text-sm">{team.leadName}</span>
            </div>
          )}

          {/* Member Count */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">Members</span>
            <span className="text-sm">
              {team.memberCount} total, {team.activeMembers} active
            </span>
          </div>

          {/* Created Date */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">Created</span>
            <span className="text-sm">
              {team.createdAt.toLocaleDateString()}
            </span>
          </div>

          <Separator />

          {/* Quick Actions */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                className="w-full justify-start"
                size="sm"
                variant="outline"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Team
              </Button>
              <Button
                className="w-full justify-start"
                size="sm"
                variant="outline"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Members
              </Button>
              <Button
                className="w-full justify-start"
                size="sm"
                variant="outline"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Message Team
              </Button>
              <Button
                className="w-full justify-start"
                size="sm"
                variant="outline"
              >
                <Settings className="mr-2 h-4 w-4" />
                Team Settings
              </Button>
            </div>
          </div>

          <Separator />

          {/* Recent Members */}
          <div>
            <h3 className="mb-3 font-medium text-sm">Recent Members</h3>
            <div className="space-y-2">
              {mockTeamMembers.slice(0, 3).map((member) => (
                <div
                  className="flex items-center justify-between"
                  key={member.id}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                      <span className="text-primary-foreground text-xs">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      member.status === "active" ? "default" : "secondary"
                    }
                  >
                    {member.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Main Component
export const AdminTeamsManagement = () => {
  const { slug } = useParams({
    from: "/(authenticated)/org/$slug/(admin)/dashboard/teams/",
  });
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("overview");

  const handleSelectTeam = (teamId: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTeams.length === mockTeams.length) {
      setSelectedTeams([]);
    } else {
      setSelectedTeams(mockTeams.map((team) => team.id));
    }
  };

  const handleTeamClick = (team: Team) => {
    setSelectedTeam(team);
    setIsDetailPanelOpen(true);
  };

  const handleDeleteTeams = () => {
    console.log("Deleting teams:", selectedTeams);
    setDeleteDialogOpen(false);
    setSelectedTeams([]);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      archived: "outline",
    } as const;

    const icons = {
      active: <CheckCircle className="h-3 w-3" />,
      inactive: <Clock className="h-3 w-3" />,
      archived: <XCircle className="h-3 w-3" />,
    };

    return (
      <Badge
        className="flex items-center gap-1"
        variant={variants[status as keyof typeof variants]}
      >
        {icons[status as keyof typeof icons]}
        {status}
      </Badge>
    );
  };

  const stats = {
    totalTeams: mockTeams.length,
    activeTeams: mockTeams.filter((t) => t.status === "active").length,
    totalMembers: mockTeams.reduce((acc, t) => acc + t.memberCount, 0),
    activeMembers: mockTeams.reduce((acc, t) => acc + t.activeMembers, 0),
    openInvites: mockInvitations.filter((i) => i.status === "pending").length,
    avgTeamSize: Math.round(
      mockTeams.reduce((acc, t) => acc + t.memberCount, 0) / mockTeams.length
    ),
  };

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
                  <BreadcrumbPage>Teams</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="mt-2 font-bold text-2xl">Teams Management</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button size="sm" variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Members
            </Button>
            <CreateTeamForm />
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
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </div>

          {/* Quick Actions Bar */}
          {selectedTeams.length > 0 && (
            <div className="border-b bg-muted/50 px-6 py-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">
                  {selectedTeams.length} team
                  {selectedTeams.length > 1 ? "s" : ""} selected
                </span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Mail className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => setDeleteDialogOpen(true)}
                    size="sm"
                    variant="destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Tab Contents */}
          <div className="p-6">
            <TabsContent className="space-y-6" value="overview">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  change={12}
                  icon={Building2}
                  title="Total Teams"
                  value={stats.totalTeams}
                />
                <StatsCard
                  change={8}
                  icon={UserCheck}
                  title="Active Members"
                  value={stats.activeMembers}
                />
                <StatsCard
                  change={-2}
                  icon={Users}
                  title="Average Team Size"
                  value={stats.avgTeamSize}
                />
                <StatsCard
                  change={15}
                  icon={Mail}
                  title="Open Invites"
                  value={stats.openInvites}
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <TeamSizeChart />
                <ActivityChart />
              </div>

              {/* Teams Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>All Teams</CardTitle>
                      <CardDescription>
                        Manage your organization teams
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Search className="mr-2 h-4 w-4" />
                        Search
                      </Button>
                      <Button size="sm" variant="outline">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                      </Button>
                      <Button size="sm" variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={selectedTeams.length === mockTeams.length}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Team Name</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Team Lead</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-[50px]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockTeams.map((team) => (
                        <TableRow
                          className="cursor-pointer hover:bg-muted/50"
                          key={team.id}
                          onClick={() => handleTeamClick(team)}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedTeams.includes(team.id)}
                              onCheckedChange={() => handleSelectTeam(team.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {team.name}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{team.memberCount} total</span>
                              <Badge className="text-xs" variant="outline">
                                {team.activeMembers} active
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(team.status)}</TableCell>
                          <TableCell>{team.leadName || "-"}</TableCell>
                          <TableCell>
                            {team.createdAt.toLocaleDateString()}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
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
                                  <Users className="mr-2 h-4 w-4" />
                                  View Members
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  Invite Members
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Mail className="mr-2 h-4 w-4" />
                                  Send Message
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Team
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

            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Manage team memberships across all teams
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockTeamMembers.map((member) => (
                      <div
                        className="flex items-center justify-between rounded-lg border p-4"
                        key={member.id}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                            <span className="text-primary-foreground text-sm">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-muted-foreground text-sm">
                              {member.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{member.role}</Badge>
                          <Badge
                            variant={
                              member.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {member.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ActivityChart />
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity Timeline</CardTitle>
                    <CardDescription>
                      Latest team-related activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="font-medium">New team created</span>
                        <span className="text-muted-foreground">
                          "Product Team"
                        </span>
                        <span className="ml-auto text-muted-foreground">
                          2 hours ago
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="font-medium">5 members added</span>
                        <span className="text-muted-foreground">
                          to "Engineering"
                        </span>
                        <span className="ml-auto text-muted-foreground">
                          5 hours ago
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                        <span className="font-medium">3 invitations sent</span>
                        <span className="text-muted-foreground">
                          to "Design Team"
                        </span>
                        <span className="ml-auto text-muted-foreground">
                          1 day ago
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Settings</CardTitle>
                    <CardDescription>
                      Configure team-related settings and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Allow team self-creation</p>
                        <p className="text-muted-foreground text-sm">
                          Let users create their own teams
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Configure
                      </Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Default team roles</p>
                        <p className="text-muted-foreground text-sm">
                          Manage default roles for new teams
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Configure
                      </Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Invitation settings</p>
                        <p className="text-muted-foreground text-sm">
                          Set invitation expiration and policies
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Team Detail Panel */}
      <TeamDetailPanel
        isOpen={isDetailPanelOpen}
        onClose={() => setIsDetailPanelOpen(false)}
        team={selectedTeam}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Teams</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedTeams.length} team
              {selectedTeams.length > 1 ? "s" : ""}? This action cannot be
              undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={handleDeleteTeams}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
