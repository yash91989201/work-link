import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import type { ListChannelsOutputType } from "@work-link/api/lib/types";
import { Hash, Lock, MoreHorizontal, Plus, UserMinus } from "lucide-react";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useListOrgMembers } from "@/hooks/use-list-org-members";
import { queryClient, queryUtils } from "@/utils/orpc";
import { ChannelMembersPopover } from "./channel-members-popover";

export const ChannelsListTable = () => {
  const {
    data: { channels },
  } = useSuspenseQuery(
    queryUtils.communication.channel.list.queryOptions({ input: {} })
  );

  return <DataTable columns={columns} data={channels} />;
};

const getChannelTypeIcon = (type: string) => {
  switch (type) {
    case "private":
    case "direct":
      return Lock;
    default:
      return Hash;
  }
};

const getChannelTypeBadgeVariant = (type: string) => {
  switch (type) {
    case "private":
    case "direct":
      return "secondary";
    default:
      return "default";
  }
};

export const columns: ColumnDef<ListChannelsOutputType["channels"][0]>[] = [
  {
    accessorKey: "name",
    header: "Channel",
    cell: ({ row }) => {
      const channel = row.original;
      const TypeIcon = getChannelTypeIcon(channel.name);

      return (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
            <TypeIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="font-medium">{channel.name}</div>
            {channel.description && (
              <div className="text-muted-foreground text-sm">
                {channel.description}
              </div>
            )}
            {channel.isPrivate && (
              <Badge className="mt-1 text-xs" variant="outline">
                Private
              </Badge>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const channel = row.original;
      const TypeIcon = getChannelTypeIcon(channel.type);

      return (
        <Badge
          className="gap-1"
          variant={getChannelTypeBadgeVariant(channel.type)}
        >
          <TypeIcon className="h-3 w-3" />
          {channel.type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "members",
    header: "Members",
    cell: ({ row }) => {
      const channel = row.original;
      return <ChannelMembersPopover channelId={channel.id} />;
    },
  },
  {
    accessorKey: "creator",
    header: "Created by",
    cell: ({ row }) => row.original.creator.name,
  },
  {
    accessorKey: "createdAt",
    header: "Created On",
    cell: ({ row }) => {
      const channel = row.original;
      return (
        <div className="text-muted-foreground">
          {new Date(channel.createdAt).toLocaleDateString()}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const channel = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="flex flex-col items-stretch gap-1.5">
            <DropdownMenuItem asChild>
              <Suspense fallback={<Skeleton className="h-9" />}>
                <AddMemberDialog channelId={channel.id} />
              </Suspense>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Suspense fallback={<Skeleton className="h-9" />}>
                <RemoveMemberDialog channelId={channel.id} />
              </Suspense>
            </DropdownMenuItem>
            <DropdownMenuItem asChild variant="destructive">
              <DeleteChannelDialog channelId={channel.id} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function AddMemberDialog({ channelId }: { channelId: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { members } = useListOrgMembers();

  const { data: currentChannelMembers } = useSuspenseQuery(
    queryUtils.communication.channel.listMembers.queryOptions({
      input: { channelId },
    })
  );

  const currentChannelMemberIds = currentChannelMembers.map(
    (member) => member.id
  );

  const availableMembers = members.filter(
    (member) => !currentChannelMemberIds.includes(member.userId)
  );

  const { mutateAsync: addMembers, isPending } = useMutation(
    queryUtils.communication.channel.addMembers.mutationOptions({
      onSuccess: () => {
        toast.success("Members added successfully");
        setDialogOpen(false);
        queryClient.invalidateQueries({
          queryKey: queryUtils.communication.channel.listMembers.queryKey({
            input: { channelId },
          }),
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
    await addMembers({ channelId, memberIds: selectedMemberIds });
    setSelectedMemberIds([]);
  };

  return (
    <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Plus className="mr-1.5 size-4" />
          Add Members
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Members to Channel</DialogTitle>
          <DialogDescription>
            Select members to add to this channel.
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

export function RemoveMemberDialog({ channelId }: { channelId: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: members } = useSuspenseQuery(
    queryUtils.communication.channel.listMembers.queryOptions({
      input: { channelId },
    })
  );

  const { mutateAsync: removeMembers, isPending } = useMutation(
    queryUtils.communication.channel.removeMembers.mutationOptions({
      onSuccess: () => {
        toast.success("Members removed successfully");
        setDialogOpen(false);
        queryClient.invalidateQueries({
          queryKey: queryUtils.communication.channel.listMembers.queryKey({
            input: { channelId },
          }),
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
    await removeMembers({ channelId, memberIds: selectedMemberIds });
    setSelectedMemberIds([]);
  };

  return (
    <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <UserMinus className="mr-1.5 size-4" />
          <span>Remove Members</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Members from Channel</DialogTitle>
          <DialogDescription>
            Select members to remove from this channel.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {members.length > 0 ? (
              members.map((member) => (
                <div
                  className="flex items-center space-x-3 rounded-md p-2 hover:bg-muted"
                  key={member.id}
                >
                  <Checkbox
                    checked={selectedMemberIds.includes(member.id)}
                    disabled={isPending}
                    id={`member-${member.id}`}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedMemberIds((prev) => [...prev, member.id]);
                      } else {
                        setSelectedMemberIds((prev) =>
                          prev.filter((id) => id !== member.id)
                        );
                      }
                    }}
                  />
                  <label
                    className="flex flex-1 cursor-pointer items-center space-x-2"
                    htmlFor={`member-${member.id}`}
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted font-medium text-xs">
                      {member.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-sm">
                        {member.name}
                      </div>
                      <div className="truncate text-muted-foreground text-xs">
                        {member.email}
                      </div>
                    </div>
                    <Badge className="text-xs capitalize" variant="outline">
                      {member.role}
                    </Badge>
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

export function DeleteChannelDialog({ channelId }: { channelId: string }) {
  const [dialog, toggleDialog] = useState(false);
  const { mutateAsync: deleteChannel, isPending } = useMutation(
    queryUtils.communication.channel.delete.mutationOptions({
      onSuccess: () => {
        toggleDialog(false);

        queryClient.refetchQueries({
          queryKey: queryUtils.communication.channel.list.queryKey({
            input: {},
          }),
        });
      },
    })
  );
  return (
    <AlertDialog onOpenChange={toggleDialog} open={dialog}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete Channel</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you absolutely sure you want to delete this channel?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            channel and all the related resources.{" "}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => deleteChannel({ channelId })}>
            {isPending ? <Spinner /> : "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const ChannelsListTableSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          className="flex items-center space-x-4 rounded-md border p-4"
          key={index.toString()}
        >
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  </div>
);
