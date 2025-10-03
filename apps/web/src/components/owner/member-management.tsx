import { Filter, Search, UserPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InviteMemberDialog } from "./invite-member-dialog";
import { MemberTable } from "./member-table";
import { RoleChangeDialog } from "./role-change-dialog";

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
              <CardDescription>
                Manage organization members and their roles
              </CardDescription>
            </div>
            <Button onClick={() => setIsInviteDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
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
                placeholder="Search members..."
                value={searchQuery}
              />
            </div>
            <Button size="icon" variant="outline">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <MemberTable
            currentUserId="current-user-id"
            members={filteredMembers}
            onRoleChange={handleRoleChange} // Replace with actual current user ID
          />
        </CardContent>
      </Card>

      <InviteMemberDialog
        onOpenChange={setIsInviteDialogOpen}
        open={isInviteDialogOpen}
      />

      {selectedMember && (
        <RoleChangeDialog
          member={selectedMember}
          onOpenChange={setIsRoleChangeDialogOpen}
          open={isRoleChangeDialogOpen}
        />
      )}
    </div>
  );
};

