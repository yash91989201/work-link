"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Mail,
  Phone,
  MapPin,
  Building2,
  Users,
  Clock,
  Award,
  Target,
  Activity,
  TrendingUp,
  TrendingDown,
  Edit,
  MessageSquare,
  MoreHorizontal,
  Crown,
  Shield,
  UserPlus,
  Star,
  BookOpen,
  Flag,
  CheckCircle,
} from "lucide-react";

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
        return <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Active
        </Badge>;
      case "away":
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Away
        </Badge>;
      case "inactive":
        return <Badge variant="outline" className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          Inactive
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={mockMember.avatar} />
              <AvatarFallback className="text-lg">
                {mockMember.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{mockMember.name}</h2>
              <p className="text-muted-foreground">{mockMember.email}</p>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge(mockMember.status)}
                <div className="flex items-center gap-1">
                  {getRoleIcon(mockMember.role)}
                  <Badge variant="outline" className="capitalize">
                    {mockMember.role}
                  </Badge>
                </div>
                <Badge variant="secondary">{mockMember.team}</Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Award className="h-4 w-4 mr-2" />
                  Add Achievement
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Target className="h-4 w-4 mr-2" />
                  Set Goals
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Users className="h-4 w-4 mr-2" />
                  Transfer Teams
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Shield className="h-4 w-4 mr-2" />
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
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full">
          <div className="border-b px-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6 space-y-6">
            <TabsContent value="overview" className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{mockMember.engagement}%</div>
                    <p className="text-sm text-muted-foreground">Engagement</p>
                    <TrendingUp className="h-4 w-4 mx-auto text-green-600 mt-1" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{mockMember.performance}%</div>
                    <p className="text-sm text-muted-foreground">Performance</p>
                    <TrendingUp className="h-4 w-4 mx-auto text-blue-600 mt-1" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{mockMember.projectsCompleted}</div>
                    <p className="text-sm text-muted-foreground">Projects Done</p>
                    <Award className="h-4 w-4 mx-auto text-purple-600 mt-1" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{mockMember.currentProjects}</div>
                    <p className="text-sm text-muted-foreground">Current Projects</p>
                    <Target className="h-4 w-4 mx-auto text-orange-600 mt-1" />
                  </CardContent>
                </Card>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{mockMember.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">{mockMember.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">{mockMember.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Department</p>
                        <p className="text-sm text-muted-foreground">{mockMember.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Joined</p>
                        <p className="text-sm text-muted-foreground">{formatDate(mockMember.joinDate)}</p>
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
                      <div key={achievement.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-yellow-100">
                            <Star className="h-4 w-4 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-medium">{achievement.title}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(achievement.date)}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {achievement.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Overall Performance</span>
                        <span className="text-sm font-medium">{mockMember.performance}%</span>
                      </div>
                      <Progress value={mockMember.performance} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Engagement Score</span>
                        <span className="text-sm font-medium">{mockMember.engagement}%</span>
                      </div>
                      <Progress value={mockMember.engagement} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Satisfaction Rating</span>
                        <span className="text-sm font-medium">{mockMember.satisfaction}/5.0</span>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(mockMember.satisfaction)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
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
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-3xl font-bold">{mockMember.projectsCompleted}</div>
                      <p className="text-sm text-muted-foreground">Projects Completed</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-3xl font-bold">{mockMember.currentProjects}</div>
                      <p className="text-sm text-muted-foreground">Current Projects</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="team" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>{mockMember.name}'s current team</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockMember.teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest actions and contributions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockMember.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="p-2 rounded-full bg-blue-100 mt-1">
                          <Activity className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">{activity.project}</p>
                          <p className="text-xs text-muted-foreground mt-1">
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