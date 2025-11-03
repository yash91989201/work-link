import { useSuspenseQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { queryUtils } from "@/utils/orpc";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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

export const JoinRequests = ({ channelId }: { channelId: string }) => {
  const { data: joinRequests } = useSuspenseQuery(
    queryUtils.communication.channel.listJoinRequests.queryOptions({
      input: { channelId },
    })
  );

  return (
    <Accordion collapsible defaultValue="join-requests" type="single">
      <AccordionItem value="join-requests">
        <AccordionTrigger className="px-0 hover:no-underline">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium text-foreground text-sm">
              Join Requests ({joinRequests.length})
            </h4>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-0">
          <div className="space-y-2">
            {joinRequests.map((request) => (
              <div
                className="rounded-lg border border-border/50 bg-muted/20 p-3"
                key={request.id}
              >
                <div className="mb-2 flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      alt={request.user.name}
                      src={request.user.image || undefined}
                    />
                    <AvatarFallback className="text-xs">
                      {getInitials(request.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="font-medium text-foreground text-sm">
                        {request.user.name}
                      </p>
                      <span className="text-muted-foreground text-xs">
                        {formatRelativeTime(request.requestedAt)}
                      </span>
                    </div>
                    <p className="mb-2 text-muted-foreground text-xs">
                      {request.user.email}
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {request.note}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" size="sm" variant="default">
                    Approve
                  </Button>
                  <Button className="flex-1" size="sm" variant="outline">
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
