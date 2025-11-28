import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Building2, Calendar, MoreHorizontal, Users } from "lucide-react";
import { CreateTeamForm } from "@/components/admin/team/create-team-form";
import {
  AddTeamMemberDialog,
  RemoveTeamMemberDialog,
} from "@/components/owner/team-member-dialogs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { queryClient, queryUtils } from "@/utils/orpc";

export const TeamList = () => {
  const {
    data: { teams },
  } = useSuspenseQuery(queryUtils.admin.team.listTeams.queryOptions({}));

  const { mutateAsync: deleteTeam } = useMutation({
    mutationKey: ["delete-team"],
    mutationFn: async ({ teamId }: { teamId: string }) => {
      await authClient.organization.removeTeam({
        teamId,
      });
    },
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: queryUtils.admin.team.listTeams.queryKey({}),
      });
    },
  });

  if (teams.length === 0) {
    return (
      <div className="py-8 text-center">
        <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 font-medium text-lg">No teams found</h3>
        <p className="mb-4 text-muted-foreground">
          Get started by creating your first team.
        </p>
        <CreateTeamForm />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => (
        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          key={team.id}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{team.name}</CardTitle>
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
                  <DropdownMenuItem asChild>
                    <AddTeamMemberDialog teamId={team.id} />
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <RemoveTeamMemberDialog teamId={team.id} />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => deleteTeam({ teamId: team.id })}
                  >
                    Delete Team
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{team.teamMembers.length}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(team.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const TeamListSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <Card key={index.toString()}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="w-full space-y-2">
              <Skeleton className="h-6 w-3/4" />
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);
