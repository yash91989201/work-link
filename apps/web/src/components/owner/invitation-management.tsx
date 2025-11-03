import { Filter, MailPlus, Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InvitationTable } from "./invitation-table";

interface Invitation {
  id: string;
  email: string;
  role: "admin" | "member";
  status: "pending" | "accepted" | "rejected" | "expired";
  createdAt: string;
  expiresAt: string;
  inviterName: string;
  teamName?: string;
}

export const InvitationManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - replace with actual API calls
  const invitations: Invitation[] = [
    {
      id: "1",
      email: "alice@example.com",
      role: "admin",
      status: "pending",
      createdAt: "2024-01-15",
      expiresAt: "2024-01-22",
      inviterName: "John Doe",
    },
    {
      id: "2",
      email: "bob@example.com",
      role: "member",
      status: "accepted",
      createdAt: "2024-01-10",
      expiresAt: "2024-01-17",
      inviterName: "Jane Smith",
      teamName: "Development Team",
    },
    {
      id: "3",
      email: "charlie@example.com",
      role: "member",
      status: "expired",
      createdAt: "2024-01-05",
      expiresAt: "2024-01-12",
      inviterName: "John Doe",
    },
  ];

  const filteredInvitations = invitations.filter(
    (invitation) =>
      invitation.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invitation.inviterName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = invitations.filter(
    (inv) => inv.status === "pending"
  ).length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Invitation Management
                {pendingCount > 0 && (
                  <Badge variant="secondary">{pendingCount} pending</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Manage organization invitations and track their status
              </CardDescription>
            </div>
            <Button>
              <MailPlus className="mr-2 h-4 w-4" />
              Send Invitation
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search invitations..."
                value={searchQuery}
              />
            </div>
            <Button size="icon" variant="outline">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <InvitationTable invitations={filteredInvitations} />
        </CardContent>
      </Card>
    </div>
  );
};
