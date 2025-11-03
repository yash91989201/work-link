import { useSuspenseQuery } from "@tanstack/react-query";
import { Crown, MoreHorizontal, Shield, User } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Member {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  avatar?: string;
  joinedAt: string;
  status: "active" | "inactive";
}

interface MemberTableProps {
  members: Member[];
  onRoleChange: (member: Member) => void;
  currentUserId: string;
}

const getRoleBadgeVariant = (role: Member["role"]) => {
  switch (role) {
    case "owner":
      return "default";
    case "admin":
      return "secondary";
    case "member":
      return "outline";
    default:
      return "outline";
  }
};

const getRoleIcon = (role: Member["role"]) => {
  switch (role) {
    case "owner":
      return Crown;
    case "admin":
      return Shield;
    case "member":
      return User;
    default:
      return User;
  }
};

export const MemberTable = () => {
  const {
    data: { members },
  } = useSuspenseQuery({
    queryFn: () => {
      members: [];
    },
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-[70px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.length === 0 ? (
            <TableRow>
              <TableCell className="py-8 text-center" colSpan={5}>
                <div className="flex flex-col items-center gap-2">
                  <User className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">No members found</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            members.map((member) => {
              const RoleIcon = getRoleIcon(member.role);
              const isCurrentUser = member.id === currentUserId;

              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-muted-foreground text-sm">
                          {member.email}
                        </div>
                        {isCurrentUser && (
                          <Badge className="mt-1 text-xs" variant="outline">
                            You
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className="gap-1"
                      variant={getRoleBadgeVariant(member.role)}
                    >
                      <RoleIcon className="h-3 w-3" />
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        member.status === "active" ? "default" : "secondary"
                      }
                    >
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {!isCurrentUser && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onRoleChange(member)}
                          >
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
