import { useState } from "react";
import { TeamList } from "./team-list";
import { CreateTeamDialog } from "./create-team-dialog";
import { TeamDetailsDialog } from "./team-details-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

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
      (team.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
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
              <CardDescription>Create and manage organization teams</CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <TeamList
            teams={filteredTeams}
            onTeamClick={handleTeamDetails}
          />
        </CardContent>
      </Card>

      <CreateTeamDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      {selectedTeam && (
        <TeamDetailsDialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          team={selectedTeam}
        />
      )}
    </div>
  );
};