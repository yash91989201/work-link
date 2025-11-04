import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { Invitation } from "better-auth/plugins/organization";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  Crown,
  Mail,
  MoreHorizontal,
  Shield,
  UserPlus,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

// Extended invitation type that includes createdAt
type ExtendedInvitation = Invitation & {
  createdAt: Date;
};

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

      return data as ExtendedInvitation[];
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
    mutationFn: async (invitation: ExtendedInvitation) => {
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

  const handleResendInvitation = (invitation: ExtendedInvitation) => {
    resendInvitationMutation.mutate(invitation);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-3 w-3 text-yellow-600" />;
      case "accepted":
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case "rejected":
        return <XCircle className="h-3 w-3 text-red-600" />;
      case "expired":
        return <AlertCircle className="h-3 w-3 text-gray-600" />;
      default:
        return <Clock className="h-3 w-3 text-gray-600" />;
    }
  };

  const handleCopyInvitationLink = (invitation: ExtendedInvitation) => {
    const invitationLink = `${env.VITE_WEB_URL}/accept-invitation/${invitation.id}?email=${invitation.email}`;
    navigator.clipboard.writeText(invitationLink);
    toast.success("Invitation link copied to clipboard");
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-3 w-3 text-red-600" />;
      case "manager":
        return <Shield className="h-3 w-3 text-blue-600" />;
      case "team-lead":
        return <UserPlus className="h-3 w-3 text-green-600" />;
      default:
        return <UserPlus className="h-3 w-3 text-gray-600" />;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitationList.length === 0 ? (
            <TableRow>
              <TableCell className="h-24 text-center" colSpan={5}>
                <div className="flex flex-col items-center gap-2">
                  <Mail className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">
                    No invitations found
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            invitationList.map((invitation) => (
              <TableRow className="hover:bg-muted/50" key={invitation.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {invitation.email.split("@")[0].charAt(0).toUpperCase()}
                        {invitation.email
                          .split("@")[0]
                          .split(".")
                          .pop()
                          ?.charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {invitation.email
                          .split("@")[0]
                          .charAt(0)
                          .toUpperCase() +
                          invitation.email
                            .split("@")[0]
                            .slice(1)
                            .replace(".", " ")}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {invitation.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getRoleIcon(invitation.role)}
                    <Badge
                      className="capitalize"
                      variant={getRoleBadgeVariant(invitation.role)}
                    >
                      {invitation.role}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(invitation.status)}
                    <Badge
                      className="capitalize"
                      variant={getStatusBadgeVariant(invitation.status)}
                    >
                      {invitation.status}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {invitation.status === "accepted" ? (
                      <div className="text-muted-foreground text-sm">N/A</div>
                    ) : (
                      <div className="text-sm">
                        <p
                          className={
                            new Date(invitation.expiresAt) < new Date()
                              ? "text-red-600"
                              : ""
                          }
                        >
                          {new Date(invitation.expiresAt).toLocaleDateString()}
                        </p>
                        <p
                          className={`text-xs ${
                            new Date(invitation.expiresAt) < new Date()
                              ? "text-red-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          {new Date(invitation.expiresAt) < new Date()
                            ? "Expired"
                            : `${Math.ceil(
                                (new Date(invitation.expiresAt).getTime() -
                                  new Date().getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )} days left`}
                        </p>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {invitation.status === "accepted" ? (
                    <div className="text-muted-foreground text-sm">N/A</div>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="h-8 w-8 p-0" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => handleCopyInvitationLink(invitation)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy link
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={resendInvitationMutation.isPending}
                          onClick={() => handleResendInvitation(invitation)}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Resend email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          disabled={cancelInvitationMutation.isPending}
                          onClick={() => handleCancelInvitation(invitation.id)}
                        >
                          Cancel invitation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export const InvitationListTableSkeleton = () => (
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index.toString()}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="h-8 w-8" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
