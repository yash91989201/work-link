import {
  Building2,
  Calendar,
  MoreHorizontal,
  UserPlus,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      <div className="py-8 text-center">
        <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 font-medium text-lg">No teams found</h3>
        <p className="mb-4 text-muted-foreground">
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
          className="cursor-pointer transition-shadow hover:shadow-md"
          key={team.id}
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
                    onClick={(e) => e.stopPropagation()}
                    size="sm"
                    variant="ghost"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onTeamClick(team);
                    }}
                  >
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
              <Badge
                variant={team.status === "active" ? "default" : "secondary"}
              >
                {team.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
