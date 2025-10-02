import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Mail, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface Invitation {
  id: string;
  email: string;
  role: "admin" | "member";
  status: "pending" | "accepted" | "rejected" | "expired";
  createdAt: string;
  expiresAt: string;
  inviterName: string;
  teamName?: string;
}

interface InvitationTableProps {
  invitations: Invitation[];
}

const getStatusBadgeVariant = (status: Invitation["status"]) => {
  switch (status) {
    case "pending":
      return "secondary";
    case "accepted":
      return "default";
    case "rejected":
      return "destructive";
    case "expired":
      return "outline";
    default:
      return "outline";
  }
};

const getStatusIcon = (status: Invitation["status"]) => {
  switch (status) {
    case "pending":
      return Clock;
    case "accepted":
      return CheckCircle;
    case "rejected":
      return XCircle;
    case "expired":
      return AlertCircle;
    default:
      return Clock;
  }
};

const getRoleBadgeVariant = (role: Invitation["role"]) => {
  switch (role) {
    case "admin":
      return "secondary";
    case "member":
      return "outline";
    default:
      return "outline";
  }
};

export const InvitationTable = ({ invitations }: InvitationTableProps) => {
  if (invitations.length === 0) {
    return (
      <div className="text-center py-8">
        <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No invitations found</h3>
        <p className="text-muted-foreground">
          No invitations match your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Invited By</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation) => {
            const StatusIcon = getStatusIcon(invitation.status);
            
            return (
              <TableRow key={invitation.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{invitation.email}</div>
                      {invitation.teamName && (
                        <div className="text-sm text-muted-foreground">
                          Team: {invitation.teamName}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(invitation.role)}>
                    {invitation.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(invitation.status)} className="gap-1">
                    <StatusIcon className="h-3 w-3" />
                    {invitation.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {invitation.inviterName}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(invitation.expiresAt).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {invitation.status === "pending" && (
                        <>
                          <DropdownMenuItem>
                            Resend Invitation
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Cancel Invitation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};