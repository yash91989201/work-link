import { Search, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export const Members = ({
  memberCount,
  members,
}: {
  memberCount: number;
  members: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string | null;
    isOnline: boolean;
    lastSeen: Date;
  }[];
}) => {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-medium text-foreground text-sm">
            Members ({memberCount})
          </h4>
        </div>
        <Button className="h-6 w-6" size="icon" variant="ghost">
          <Search className="h-3 w-3" />
        </Button>
      </div>
      <div className="space-y-1">
        {members.map((member) => (
          <div
            className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
            key={member.id}
          >
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  alt={member.name}
                  src={member.avatar || undefined}
                />
                <AvatarFallback className="text-xs">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
              <div
                className={`absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-background ${
                  member.isOnline ? "bg-green-500" : "bg-muted-foreground"
                }`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium text-foreground text-sm">
                  {member.name}
                </p>
                {member.role === "admin" && (
                  <Badge className="px-1.5 py-0 text-xs" variant="default">
                    Admin
                  </Badge>
                )}

                {member.role === "moderator" && (
                  <Badge className="px-1.5 py-0 text-xs" variant="secondary">
                    Mod
                  </Badge>
                )}
              </div>
              <p className="truncate text-muted-foreground text-xs">
                {member.isOnline
                  ? "Active now"
                  : `Last seen ${formatRelativeTime(member.lastSeen)}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
