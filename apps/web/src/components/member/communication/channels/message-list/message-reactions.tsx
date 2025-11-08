import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { cn } from "@/lib/utils";

interface Reaction {
  reaction: string;
  userId: string;
  createdAt: string;
}

interface MessageReactionsProps {
  reactions?: Reaction[];
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: (emoji: string) => void;
  userNames?: Map<string, string>;
}

interface GroupedReaction {
  emoji: string;
  count: number;
  userIds: string[];
  hasCurrentUser: boolean;
}

export function MessageReactions({
  reactions = [],
  onAddReaction,
  onRemoveReaction,
  userNames,
}: MessageReactionsProps) {
  const { user } = useAuthedSession();

  const groupedReactions = useMemo(() => {
    const groups = new Map<string, GroupedReaction>();

    for (const reaction of reactions) {
      const existing = groups.get(reaction.reaction);
      if (existing) {
        existing.count += 1;
        existing.userIds.push(reaction.userId);
        if (reaction.userId === user.id) {
          existing.hasCurrentUser = true;
        }
      } else {
        groups.set(reaction.reaction, {
          emoji: reaction.reaction,
          count: 1,
          userIds: [reaction.userId],
          hasCurrentUser: reaction.userId === user.id,
        });
      }
    }

    return Array.from(groups.values()).sort((a, b) => b.count - a.count);
  }, [reactions, user.id]);

  if (groupedReactions.length === 0) return null;

  const getUserNamesString = (userIds: string[]): string => {
    if (!userNames) {
      return `${userIds.length} ${userIds.length === 1 ? "person" : "people"}`;
    }

    const names = userIds
      .map((id) => {
        if (id === user.id) return "You";
        return userNames.get(id) || "Someone";
      })
      .slice(0, 5);

    if (userIds.length > 5) {
      return `${names.join(", ")} and ${userIds.length - 5} more`;
    }

    if (names.length === 1) return names[0];
    if (names.length === 2) return names.join(" and ");

    const lastName = names.pop();
    return `${names.join(", ")}, and ${lastName}`;
  };

  return (
    <div className="mt-1 flex flex-wrap gap-1">
      <TooltipProvider>
        {groupedReactions.map((reaction) => (
          <Tooltip key={reaction.emoji}>
            <TooltipTrigger asChild>
              <Button
                className={cn(
                  "h-auto gap-1 rounded-full px-2 py-0.5 text-xs",
                  reaction.hasCurrentUser
                    ? "border-primary/50 bg-primary/10 hover:bg-primary/20"
                    : "bg-background hover:bg-muted"
                )}
                onClick={() => {
                  if (reaction.hasCurrentUser) {
                    onRemoveReaction(reaction.emoji);
                  } else {
                    onAddReaction(reaction.emoji);
                  }
                }}
                size="sm"
                type="button"
                variant="outline"
              >
                <span className="text-base leading-none">{reaction.emoji}</span>
                <span className="font-medium">{reaction.count}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{getUserNamesString(reaction.userIds)}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}
