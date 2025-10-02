import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserPlus, Building2, MoreHorizontal, Users, Calendar } from "lucide-react";

interface Team {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  createdAt: string;
  status: "active" | "inactive";
}

interface TeamListProps {
  teams: Team[];
  onTeamClick: (team: Team) => void;
}

export const TeamList = ({ teams, onTeamClick }: TeamListProps) => {
  if (teams.length === 0) {
    return (
      <div className="text-center py-8">
        <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No teams found</h3>
        <p className="text-muted-foreground mb-4">
          Get started by creating your first team.
        </p>
        <Button onClick={() => {}}>
          <UserPlus className="mr-2 h-4 w-4" />
          Create Team
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => (
        <Card 
          key={team.id} 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onTeamClick(team)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{team.name}</CardTitle>
                {team.description && (
                  <CardDescription className="line-clamp-2">
                    {team.description}
                  </CardDescription>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onTeamClick(team);
                  }}>
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                    Edit Team
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Delete Team
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{team.memberCount} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(team.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <Badge variant={team.status === "active" ? "default" : "secondary"}>
                {team.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};