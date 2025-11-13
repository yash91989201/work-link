import { useSuspenseQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { queryUtils } from "@/utils/orpc";

interface ChannelMembersPopoverProps {
  channelId: string;
}

export const ChannelMembersPopover = ({
  channelId,
}: ChannelMembersPopoverProps) => {
  const { data: members } = useSuspenseQuery(
    queryUtils.communication.channel.listMembers.queryOptions({
      input: {
        channelId,
      },
    })
  );

  const memberCount = members.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="gap-1" size="sm" variant="outline">
          <Users className="h-3 w-3" />
          {memberCount}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Members ({memberCount})</h4>
          {memberCount > 0 ? (
            <div className="space-y-2">
              {members.map((member) => (
                <div className="flex items-center gap-2" key={member.id}>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={member.image ?? undefined} />
                    <AvatarFallback className="text-xs">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
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
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No members</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

