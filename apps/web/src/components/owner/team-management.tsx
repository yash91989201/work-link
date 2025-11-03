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
import { CreateTeamDialog } from "./create-team-dialog";
import { TeamDetailsDialog } from "./team-details-dialog";
import { TeamList } from "./team-list";

interface Team {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  createdAt: string;
  status: "active" | "inactive";
}

export const TeamManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - replace with actual API calls
  const teams: Team[] = [
    {
      id: "1",
      name: "Development Team",
      description: "Core product development team",
      memberCount: 8,
      createdAt: "2024-01-15",
      status: "active",
    },
    {
      id: "2",
      name: "Marketing Team",
      description: "Marketing and growth initiatives",
      memberCount: 4,
      createdAt: "2024-01-20",
      status: "active",
    },
    {
      id: "3",
      name: "Support Team",
      description: "Customer support and success",
      memberCount: 3,
      createdAt: "2024-02-01",
      status: "active",
    },
  ];

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.description?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false)
  );

  const handleTeamDetails = (team: Team) => {
    setSelectedTeam(team);
    setIsDetailsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                Create and manage organization teams
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Create Team
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
                placeholder="Search teams..."
                value={searchQuery}
              />
            </div>
            <Button size="icon" variant="outline">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <TeamList onTeamClick={handleTeamDetails} teams={filteredTeams} />
        </CardContent>
      </Card>

      <CreateTeamDialog
        onOpenChange={setIsCreateDialogOpen}
        open={isCreateDialogOpen}
      />

      {selectedTeam && (
        <TeamDetailsDialog
          onOpenChange={setIsDetailsDialogOpen}
          open={isDetailsDialogOpen}
          team={selectedTeam}
        />
      )}
    </div>
  );
};
