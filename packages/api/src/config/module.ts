import type { ModuleType } from "@/lib/types";

export const MODULES: ModuleType[] = [
  {
    id: "communication",
    name: "Communication",
    description: "Team chat, mentions, media, and calls",
    features: [
      { id: "channels", name: "Channels" },
      { id: "mentions", name: "Mentions" },
      { id: "media", name: "Media" },
      { id: "calls", name: "Calls" },
    ],
  },
  {
    id: "attendance",
    name: "Attendance",
    description: "Punch-in/out and logs",
    features: [
      { id: "mark", name: "Mark Attendance" },
      { id: "overview", name: "Overview" },
      { id: "logs", name: "Logs", roles: ["owner", "admin"] },
    ],
  },
  {
    id: "hr",
    name: "HR Management",
    description: "Employee directory, leave requests, and HR reports",
    features: [
      { id: "employees", name: "Employees" },
      { id: "leave-requests", name: "Leave Requests" },
      { id: "reports", name: "Reports", roles: ["owner", "admin"] },
    ],
  },
];
