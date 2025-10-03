"use client";

import {
  Building2,
  Calendar,
  FileText,
  Mail,
  Settings,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateTeamDialog } from "../create-team-dialog";

interface QuickActionsProps {
  className?: string;
}

export const QuickActions = ({ className }: QuickActionsProps) => {
  const quickActions = [
    {
      title: "Invite New Member",
      description: "Send invitation to join your organization",
      icon: UserPlus,
      action: "invite-member",
      variant: "default" as const,
    },
    {
      title: "Create New Team",
      description: "Set up a new team for collaboration",
      icon: Building2,
      action: "create-team",
      variant: "default" as const,
    },
    {
      title: "Schedule Event",
      description: "Organize a meeting or team event",
      icon: Calendar,
      action: "schedule-event",
      variant: "outline" as const,
    },
    {
      title: "Send Announcement",
      description: "Broadcast message to all members",
      icon: Mail,
      action: "send-announcement",
      variant: "outline" as const,
    },
    {
      title: "Generate Report",
      description: "Create performance or analytics report",
      icon: FileText,
      action: "generate-report",
      variant: "outline" as const,
    },
    {
      title: "Organization Settings",
      description: "Manage organization preferences",
      icon: Settings,
      action: "org-settings",
      variant: "outline" as const,
    },
  ];

  const handleAction = (action: string) => {
    console.log(`Quick action clicked: ${action}`);
    // Handle different actions
    switch (action) {
      case "invite-member":
        // Open invite member dialog
        break;
      case "create-team":
        // Handled by CreateTeamDialog
        break;
      case "schedule-event":
        // Open schedule event dialog
        break;
      case "send-announcement":
        // Open announcement dialog
        break;
      case "generate-report":
        // Open report generation
        break;
      case "org-settings":
        // Navigate to settings
        break;
      default:
        break;
    }
  };

  const renderActionButton = (action: (typeof quickActions)[0]) => {
    if (action.action === "create-team") {
      return (
        <CreateTeamDialog>
          <Button className="w-full justify-start" variant={action.variant}>
            <action.icon className="mr-2 h-4 w-4" />
            {action.title}
          </Button>
        </CreateTeamDialog>
      );
    }

    return (
      <Button
        className="w-full justify-start"
        onClick={() => handleAction(action.action)}
        variant={action.variant}
      >
        <action.icon className="mr-2 h-4 w-4" />
        {action.title}
      </Button>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common administrative tasks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickActions.map((action) => (
          <div key={action.action}>{renderActionButton(action)}</div>
        ))}
      </CardContent>
    </Card>
  );
};

