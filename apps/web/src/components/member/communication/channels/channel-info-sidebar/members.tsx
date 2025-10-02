import { Search, Users, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
  members,
}: {
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
  // Dummy state for search UI and active count
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showSearch) {
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [showSearch]);

  return (
    <Accordion collapsible defaultValue="members" type="single">
      <AccordionItem value="members">
        <AccordionTrigger className="px-0 hover:no-underline">
          <div className="flex flex-1 items-center gap-1.5">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium text-foreground text-sm">Members</h4>
            <Badge className="text-xs" variant="outline">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
              3
            </Badge>
          </div>
          <Button
            aria-label={showSearch ? "Close search" : "Open search"}
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              setShowSearch((s) => !s);
            }}
            size="icon"
            variant="ghost"
          >
            {showSearch ? (
              <X className="h-3 w-3" />
            ) : (
              <Search className="h-3 w-3" />
            )}
          </Button>
        </AccordionTrigger>
        <AccordionContent className="pt-0">
          {/* Sliding search input */}
          <div
            className={cn(
              "overflow-hidden transition-[max-height,opacity,transform] duration-200 ease-out",
              showSearch
                ? "max-h-16 translate-y-0 opacity-100"
                : "-translate-y-1 max-h-0 opacity-0"
            )}
          >
            <div className="p-3">
              <Input
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search members (mock)"
                ref={inputRef}
                value={query}
              />
            </div>
          </div>

          <div className="space-y-1">
            {members.map((member) => (
              <div
                className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                key={member.id}
                title="Mock navigation"
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
                    className={cn(
                      "absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-background",
                      member.isOnline ? "bg-green-500" : "bg-muted-foreground"
                    )}
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
                      <Badge
                        className="px-1.5 py-0 text-xs"
                        variant="secondary"
                      >
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
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
