import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Plus, UserMinus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useListOrgMembers } from "@/hooks/use-list-org-members";
import { queryClient, queryUtils } from "@/utils/orpc";

export function AddTeamMemberDialog({ teamId }: { teamId: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { members } = useListOrgMembers();

  const {
    data: { teams },
  } = useSuspenseQuery(queryUtils.admin.team.listTeams.queryOptions({}));

  const currentTeam = teams.find((team) => team.id === teamId);
  const currentTeamMemberIds =
    currentTeam?.teamMembers.map((member) => member.userId) || [];

  const availableMembers = members.filter(
    (member) => !currentTeamMemberIds.includes(member.userId)
  );

  const { mutateAsync: addMember, isPending } = useMutation(
    queryUtils.admin.team.addMember.mutationOptions({
      onSuccess: () => {
        toast.success("Member added successfully");
        setDialogOpen(false);
        queryClient.invalidateQueries({
          queryKey: queryUtils.admin.team.listTeams.queryKey({}),
        });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const onSubmit = async () => {
    if (selectedMemberIds.length === 0) {
      toast.error("Please select at least one member to add");
      return;
    }

    // Add all members in a single API call
    await addMember({ teamId, userIds: selectedMemberIds });
    setSelectedMemberIds([]);
  };

  return (
    <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <Plus className="mr-1.5 size-4" />
          Add Members
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Members to Team</DialogTitle>
          <DialogDescription>
            Select members to add to this team.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {availableMembers.length > 0 ? (
              availableMembers.map((member) => (
                <div
                  className="flex items-center space-x-3 rounded-md p-2 hover:bg-muted"
                  key={member.userId}
                >
                  <Checkbox
                    checked={selectedMemberIds.includes(member.userId)}
                    disabled={isPending}
                    id={`member-${member.userId}`}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedMemberIds((prev) => [
                          ...prev,
                          member.userId,
                        ]);
                      } else {
                        setSelectedMemberIds((prev) =>
                          prev.filter((id) => id !== member.userId)
                        );
                      }
                    }}
                  />
                  <label
                    className="flex flex-1 cursor-pointer items-center space-x-2"
                    htmlFor={`member-${member.userId}`}
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted font-medium text-xs">
                      {member.user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-sm">
                        {member.user.name}
                      </div>
                      <div className="truncate text-muted-foreground text-xs">
                        {member.user.email}
                      </div>
                    </div>
                    <Badge className="text-xs capitalize" variant="outline">
                      {member.role}
                    </Badge>
                  </label>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No members to add</p>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setDialogOpen(false);
                setSelectedMemberIds([]);
              }}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={isPending || selectedMemberIds.length === 0}
              onClick={onSubmit}
              type="button"
            >
              {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Add Selected
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function RemoveTeamMemberDialog({ teamId }: { teamId: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    data: { teams },
  } = useSuspenseQuery(queryUtils.admin.team.listTeams.queryOptions({}));

  const currentTeam = teams.find((team) => team.id === teamId);
  const members = currentTeam?.teamMembers || [];

  const { mutateAsync: removeMember, isPending } = useMutation(
    queryUtils.admin.team.removeMember.mutationOptions({
      onSuccess: () => {
        toast.success("Member removed successfully");
        setDialogOpen(false);
        queryClient.invalidateQueries({
          queryKey: queryUtils.admin.team.listTeams.queryKey({}),
        });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const onSubmit = async () => {
    if (selectedMemberIds.length === 0) {
      toast.error("Please select at least one member to remove");
      return;
    }

    // Remove all members in a single API call
    await removeMember({ teamId, userIds: selectedMemberIds });
    setSelectedMemberIds([]);
  };

  return (
    <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <UserMinus className="mr-1.5 size-4" />
          <span>Remove Members</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Members from Team</DialogTitle>
          <DialogDescription>
            Select members to remove from this team.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {members.length > 0 ? (
              members.map((member) => (
                <div
                  className="flex items-center space-x-3 rounded-md p-2 hover:bg-muted"
                  key={member.userId}
                >
                  <Checkbox
                    checked={selectedMemberIds.includes(member.userId)}
                    disabled={isPending}
                    id={`member-${member.userId}`}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedMemberIds((prev) => [
                          ...prev,
                          member.userId,
                        ]);
                      } else {
                        setSelectedMemberIds((prev) =>
                          prev.filter((id) => id !== member.userId)
                        );
                      }
                    }}
                  />
                  <label
                    className="flex flex-1 cursor-pointer items-center space-x-2"
                    htmlFor={`member-${member.userId}`}
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted font-medium text-xs">
                      {member.user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-sm">
                        {member.user.name}
                      </div>
                      <div className="truncate text-muted-foreground text-xs">
                        {member.user.email}
                      </div>
                    </div>
                  </label>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                No members to remove
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setDialogOpen(false);
                setSelectedMemberIds([]);
              }}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={isPending || selectedMemberIds.length === 0}
              onClick={onSubmit}
              type="button"
              variant="destructive"
            >
              {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Remove Selected
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
