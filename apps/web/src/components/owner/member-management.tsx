import { useState } from "react";
import { MemberTable } from "./member-table";
import { InviteMemberDialog } from "./invite-member-dialog";
import { RoleChangeDialog } from "./role-change-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Member {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  avatar?: string;
  joinedAt: string;
  status: "active" | "inactive";
}

export const MemberManagement = () => {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isRoleChangeDialogOpen, setIsRoleChangeDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - replace with actual API calls
  const members: Member[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "admin",
      joinedAt: "2024-01-15",
      status: "active",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "member",
      joinedAt: "2024-01-20",
      status: "active",
    },
  ];

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRoleChange = (member: Member) => {
    setSelectedMember(member);
    setIsRoleChangeDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Member Management</CardTitle>
              <CardDescription>Manage organization members and their roles</CardDescription>
            </div>
            <Button onClick={() => setIsInviteDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <MemberTable
            members={filteredMembers}
            onRoleChange={handleRoleChange}
            currentUserId="current-user-id" // Replace with actual current user ID
          />
        </CardContent>
      </Card>

      <InviteMemberDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
      />

      {selectedMember && (
        <RoleChangeDialog
          open={isRoleChangeDialogOpen}
          onOpenChange={setIsRoleChangeDialogOpen}
          member={selectedMember}
        />
      )}
    </div>
  );
};