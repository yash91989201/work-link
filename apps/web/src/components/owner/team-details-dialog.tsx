import { Calendar, Settings, UserMinus, UserPlus } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Team {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  createdAt: string;
  status: "active" | "inactive";
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
}

interface TeamDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: Team;
}

export const TeamDetailsDialog = ({
  open,
  onOpenChange,
  team,
}: TeamDetailsDialogProps) => {
  const [_isAddMemberDialogOpen, _setIsAddMemberDialogOpen] = useState(false);

  // Mock data - replace with actual API calls
  const teamMembers: TeamMember[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "Team Lead",
      joinedAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "Member",
      joinedAt: "2024-01-20",
    },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob@example.com",
      role: "Member",
      joinedAt: "2024-02-01",
    },
  ];

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {team.name}
            <Badge variant={team.status === "active" ? "default" : "secondary"}>
              {team.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {team.description || "Manage team members and settings"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Team Overview */}
          <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">{team.memberCount}</p>
                <p className="text-muted-foreground text-xs">Members</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">
                  {new Date(team.createdAt).toLocaleDateString()}
                </p>
                <p className="text-muted-foreground text-xs">Created</p>
              </div>
            </div>
          </div>

          <Tabs className="w-full" defaultValue="members">
            <TabsList>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent className="space-y-4" value="members">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-lg">Team Members</h3>
                <Button
                  onClick={() => _setIsAddMemberDialogOpen(true)}
                  size="sm"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="w-[70px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-muted-foreground text-sm">
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{member.role}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(member.joinedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost">
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent className="space-y-4" value="settings">
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Team Settings</h3>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Team Details
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Members
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="destructive"
                  >
                    Delete Team
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

