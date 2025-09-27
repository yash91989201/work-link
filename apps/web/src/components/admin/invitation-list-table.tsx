import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import type { Invitation } from "better-auth/plugins/organization";
import { Copy, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { env } from "@/env";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { getAuthQueryKey } from "@/lib/auth/query-keys";
import { authClient } from "@/lib/auth-client";
import { getRoleBadgeVariant, getStatusBadgeVariant } from "@/lib/org";

export const InvitationListTable = () => {
  const { session } = useAuthedSession();
  const orgId = session.activeOrganizationId ?? "";
  const queryClient = useQueryClient();

  const { data: invitationList } = useSuspenseQuery({
    queryKey: getAuthQueryKey.organization.invitations(orgId),
    queryFn: async () => {
      const { data, error } = await authClient.organization.listInvitations({
        query: {
          organizationId: orgId,
        },
      });

      if (error !== null) {
        throw new Error(error.message);
      }

      return data;
    },
  });

  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { data, error } = await authClient.organization.cancelInvitation({
        invitationId,
      });

      if (error !== null) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getAuthQueryKey.organization.invitations(orgId),
      });
      toast.success("Invitation cancelled successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.refetchQueries({
        queryKey: getAuthQueryKey.invitation.list(),
      });
    },
  });

  const resendInvitationMutation = useMutation({
    mutationFn: async (invitation: Invitation) => {
      const { data, error } = await authClient.organization.inviteMember({
        email: invitation.email,
        role: "admin",
        organizationId: orgId,
        resend: true,
      });

      if (error !== null) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Invitation resent successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.refetchQueries({
        queryKey: getAuthQueryKey.invitation.list(),
      });
    },
  });

  const handleCancelInvitation = (invitationId: string) => {
    cancelInvitationMutation.mutate(invitationId);
  };

  const handleResendInvitation = (invitation: Invitation) => {
    resendInvitationMutation.mutate(invitation);
  };

  const handleCopyInvitationLink = (invitation: Invitation) => {
    const invitationLink = `${env.VITE_WEB_URL}/accept-invitation/${invitation.id}?email=${invitation.email}`;
    navigator.clipboard.writeText(invitationLink);
    toast.success("Invitation link copied to clipboard");
  };

  const columns: ColumnDef<Invitation>[] = [
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Badge variant={getRoleBadgeVariant(row.getValue("role"))}>
          {row.getValue("role")}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={getStatusBadgeVariant(row.getValue("status"))}>
          {row.getValue("status")}
        </Badge>
      ),
    },
    {
      accessorKey: "expiresAt",
      header: "Expires At",
      cell: ({ row }) =>
        new Date(row.getValue("expiresAt")).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const invitation = row.original;

        if (invitation.status === "accepted") {
          return <Badge variant="outline">N/A</Badge>;
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-8 w-8 p-0" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleCopyInvitationLink(invitation)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy invitation link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={resendInvitationMutation.isPending}
                onClick={() => handleResendInvitation(invitation)}
              >
                Resend
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                disabled={cancelInvitationMutation.isPending}
                onClick={() => handleCancelInvitation(invitation.id)}
              >
                Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={invitationList} />
    </div>
  );
};

export const InvitationListTableSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index.toString()}>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
