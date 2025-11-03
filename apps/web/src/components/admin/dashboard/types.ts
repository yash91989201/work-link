// Types for dashboard components

export interface DashboardStats {
  overview: {
    totalMembers: number;
    activeMembers: number;
    totalTeams: number;
    activeTeams: number;
    openInvites: number;
    pendingApprovals: number;
    monthlyGrowth: number;
    engagementRate: number;
  };
}

export interface TeamPerformance {
  id: string;
  name: string;
  members: number;
  activeMembers: number;
  performance: number;
  trend: "up" | "down" | "stable";
  projects: number;
  completionRate?: number;
  satisfaction?: number;
  growth?: number;
}

export interface Activity {
  id: string;
  type:
    | "member_joined"
    | "member_left"
    | "team_created"
    | "project_completed"
    | "milestone_reached";
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
  team?: string;
  priority?: "low" | "medium" | "high";
  icon?: any;
  color?: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  type: "meeting" | "review" | "event" | "deadline";
  attendees: number;
  location?: string;
  status?: "scheduled" | "in-progress" | "completed" | "cancelled";
}

export interface Report {
  id: string;
  name: string;
  description: string;
  type: "performance" | "engagement" | "growth" | "attendance" | "custom";
  category: string;
  lastGenerated: Date;
  size: string;
  format: "PDF" | "Excel" | "CSV" | "Template";
  frequency: string;
  status: "completed" | "draft" | "processing" | "failed";
}

export interface ScheduledReport {
  id: string;
  name: string;
  schedule: string;
  recipients: number;
  nextRun: Date;
  active: boolean;
}

export interface Export {
  id: string;
  reportName: string;
  exportedBy: string;
  exportedAt: Date;
  format: "PDF" | "CSV" | "Excel";
  status: "completed" | "processing" | "failed";
  downloadUrl: string | null;
}

export interface Metric {
  title: string;
  value: string | number;
  change?: number;
  unit?: string;
  description?: string;
  trend?: "up" | "down" | "stable";
  icon: any;
  color?: "default" | "success" | "warning" | "danger";
}
