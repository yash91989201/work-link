"use client";

import {
  Activity,
  Award,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Crown,
  Edit,
  Mail,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Shield,
  Star,
  Target,
  TrendingUp,
  UserPlus,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock member data
const mockMember = {
  id: "1",
  name: "Sarah Johnson",
  email: "sarah@example.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  avatar: "",
  role: "Team Lead",
  team: "Engineering",
  department: "Engineering",
  joinDate: new Date("2024-01-15"),
  lastActive: new Date(),
  status: "active",
  engagement: 95,
  performance: 92,
  satisfaction: 4.5,
  projectsCompleted: 12,
  currentProjects: 3,
  skills: ["React", "TypeScript", "Node.js", "AWS", "Leadership"],
  achievements: [
    {
      id: "1",
      title: "Employee of the Quarter",
      date: new Date("2024-06-01"),
      type: "award",
    },
    {
      id: "2",
      title: "Team Leadership Excellence",
      date: new Date("2024-05-15"),
      type: "recognition",
    },
  ],
  recentActivity: [
    {
      id: "1",
      action: "Completed project milestone",
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      project: "Mobile App Redesign",
    },
    {
      id: "2",
      action: "Reviewed 5 pull requests",
      date: new Date(Date.now() - 6 * 60 * 60 * 1000),
      project: "Backend API Update",
    },
    {
      id: "3",
      action: "Mentored junior developer",
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      project: "Onboarding Program",
    },
  ],
  teamMembers: [
    {
      id: "1",
      name: "Mike Chen",
      role: "Senior Developer",
      avatar: "",
    },
    {
      id: "2",
      name: "Emily Davis",
      role: "UI/UX Designer",
      avatar: "",
    },
    {
      id: "3",
      name: "Alex Wilson",
      role: "Junior Developer",
      avatar: "",
    },
  ],
};

interface MemberProfileProps {
  memberId: string;
  onClose?: () => void;
}

export const MemberProfile = ({ memberId, onClose }: MemberProfileProps) => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [newRole, setNewRole] = useState("");

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4 text-red-600" />;
      case "manager":
        return <Shield className="h-4 w-4 text-blue-600" />;
      case "team-lead":
        return <UserPlus className="h-4 w-4 text-green-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="flex items-center gap-1" variant="default">
            <CheckCircle className="h-3 w-3" />
            Active
          </Badge>
        );
      case "away":
        return (
          <Badge className="flex items-center gap-1" variant="secondary">
            <Clock className="h-3 w-3" />
            Away
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="flex items-center gap-1" variant="outline">
            <Users className="h-3 w-3" />
            Inactive
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={mockMember.avatar} />
              <AvatarFallback className="text-lg">
                {mockMember.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-bold text-2xl">{mockMember.name}</h2>
              <p className="text-muted-foreground">{mockMember.email}</p>
              <div className="mt-2 flex items-center gap-2">
                {getStatusBadge(mockMember.status)}
                <div className="flex items-center gap-1">
                  {getRoleIcon(mockMember.role)}
                  <Badge className="capitalize" variant="outline">
                    {mockMember.role}
                  </Badge>
                </div>
                <Badge variant="secondary">{mockMember.team}</Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Message
            </Button>
            <Button size="sm" variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Award className="mr-2 h-4 w-4" />
                  Add Achievement
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Target className="mr-2 h-4 w-4" />
                  Set Goals
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  Transfer Teams
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Shield className="mr-2 h-4 w-4" />
                  Change Role
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  Remove Member
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Tabs
          className="h-full"
          onValueChange={setSelectedTab}
          value={selectedTab}
        >
          <div className="border-b px-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
          </div>

          <div className="space-y-6 p-6">
            <TabsContent className="space-y-6" value="overview">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="font-bold text-2xl text-green-600">
                      {mockMember.engagement}%
                    </div>
                    <p className="text-muted-foreground text-sm">Engagement</p>
                    <TrendingUp className="mx-auto mt-1 h-4 w-4 text-green-600" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="font-bold text-2xl text-blue-600">
                      {mockMember.performance}%
                    </div>
                    <p className="text-muted-foreground text-sm">Performance</p>
                    <TrendingUp className="mx-auto mt-1 h-4 w-4 text-blue-600" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="font-bold text-2xl text-purple-600">
                      {mockMember.projectsCompleted}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Projects Done
                    </p>
                    <Award className="mx-auto mt-1 h-4 w-4 text-purple-600" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="font-bold text-2xl text-orange-600">
                      {mockMember.currentProjects}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Current Projects
                    </p>
                    <Target className="mx-auto mt-1 h-4 w-4 text-orange-600" />
                  </CardContent>
                </Card>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Email</p>
                        <p className="text-muted-foreground text-sm">
                          {mockMember.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Phone</p>
                        <p className="text-muted-foreground text-sm">
                          {mockMember.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Location</p>
                        <p className="text-muted-foreground text-sm">
                          {mockMember.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Department</p>
                        <p className="text-muted-foreground text-sm">
                          {mockMember.department}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Joined</p>
                        <p className="text-muted-foreground text-sm">
                          {formatDate(mockMember.joinDate)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle>Skills & Expertise</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {mockMember.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle>Achievements & Recognition</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockMember.achievements.map((achievement) => (
                      <div
                        className="flex items-center justify-between rounded-lg border p-3"
                        key={achievement.id}
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-yellow-100 p-2">
                            <Star className="h-4 w-4 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-medium">{achievement.title}</p>
                            <p className="text-muted-foreground text-sm">
                              {formatDate(achievement.date)}
                            </p>
                          </div>
                        </div>
                        <Badge className="capitalize" variant="outline">
                          {achievement.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent className="space-y-6" value="performance">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Performance Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="mb-2 flex justify-between">
                        <span className="font-medium text-sm">
                          Overall Performance
                        </span>
                        <span className="font-medium text-sm">
                          {mockMember.performance}%
                        </span>
                      </div>
                      <Progress
                        className="h-2"
                        value={mockMember.performance}
                      />
                    </div>
                    <div>
                      <div className="mb-2 flex justify-between">
                        <span className="font-medium text-sm">
                          Engagement Score
                        </span>
                        <span className="font-medium text-sm">
                          {mockMember.engagement}%
                        </span>
                      </div>
                      <Progress className="h-2" value={mockMember.engagement} />
                    </div>
                    <div>
                      <div className="mb-2 flex justify-between">
                        <span className="font-medium text-sm">
                          Satisfaction Rating
                        </span>
                        <span className="font-medium text-sm">
                          {mockMember.satisfaction}/5.0
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            className={`h-4 w-4 ${
                              i < Math.floor(mockMember.satisfaction)
                                ? "fill-current text-yellow-400"
                                : "text-gray-300"
                            }`}
                            key={i}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Project History */}
                <Card>
                  <CardHeader>
                    <CardTitle>Project Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border p-4 text-center">
                      <div className="font-bold text-3xl">
                        {mockMember.projectsCompleted}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Projects Completed
                      </p>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <div className="font-bold text-3xl">
                        {mockMember.currentProjects}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Current Projects
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent className="space-y-6" value="team">
              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    {mockMember.name}'s current team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockMember.teamMembers.map((member) => (
                      <div
                        className="flex items-center justify-between rounded-lg border p-3"
                        key={member.id}
                      >
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
                              {member.role}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          View Profile
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent className="space-y-6" value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest actions and contributions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockMember.recentActivity.map((activity) => (
                      <div
                        className="flex items-start gap-3 rounded-lg border p-3"
                        key={activity.id}
                      >
                        <div className="mt-1 rounded-full bg-blue-100 p-2">
                          <Activity className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-muted-foreground text-sm">
                            {activity.project}
                          </p>
                          <p className="mt-1 text-muted-foreground text-xs">
                            {formatRelativeTime(activity.date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
