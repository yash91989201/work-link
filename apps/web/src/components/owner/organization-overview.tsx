import { Building2, Mail, Settings, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface OrganizationOverviewProps {
  organizationName?: string;
  memberCount?: number;
  teamCount?: number;
  pendingInvitations?: number;
}

export const OrganizationOverview = ({
  organizationName = "Your Organization",
  memberCount = 0,
  teamCount = 0,
  pendingInvitations = 0,
}: OrganizationOverviewProps) => {
  const stats = [
    {
      title: "Total Members",
      value: memberCount,
      icon: Users,
      description: "Active members in your organization",
    },
    {
      title: "Teams",
      value: teamCount,
      icon: Building2,
      description: "Teams created in your organization",
    },
    {
      title: "Pending Invitations",
      value: pendingInvitations,
      icon: Mail,
      description: "Invitations awaiting response",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="col-span-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl">{organizationName}</CardTitle>
            <CardDescription>
              Organization overview and quick actions
            </CardDescription>
          </div>
          <Settings className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Owner</Badge>
            <Badge variant="outline">Active</Badge>
          </div>
        </CardContent>
      </Card>

      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stat.value}</div>
            <p className="text-muted-foreground text-xs">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
