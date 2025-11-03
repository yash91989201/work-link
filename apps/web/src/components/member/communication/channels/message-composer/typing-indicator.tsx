import { Item, ItemContent, ItemTitle } from "@/components/ui/item";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TypingIndicatorProps {
  typingUsers: { userId: string; userName: string }[];
}

function getTypingText(typingUsers: { userId: string; userName: string }[]) {
  const count = typingUsers.length;

  if (count === 0) return null;
  if (count === 1) return `${typingUsers[0].userName} is typing...`;
  if (count === 2)
    return `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`;
  if (count === 3)
    return `${typingUsers[0].userName}, ${typingUsers[1].userName}, and ${typingUsers[2].userName} are typing...`;

  return `${typingUsers[0].userName}, ${typingUsers[1].userName}, ${typingUsers[2].userName}, and ${count - 3} more are typing...`;
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  const typingText = getTypingText(typingUsers);
  const displayedUsers = typingUsers.slice(0, 3);
  const additionalUsers = typingUsers.slice(3);

  if (!typingText) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="cursor-pointer text-muted-foreground text-sm transition-colors hover:text-foreground">
          {typingText}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1.5" side="top">
        <div className="space-y-1.5">
          <p className="font-medium text-sm">Currently typing:</p>
          {displayedUsers.map((du) => (
            <div className="text-sm" key={du.userId}>
              {du.userName}
            </div>
          ))}
          {additionalUsers.length > 0 && (
            <div className="space-y-1.5">
              <p className="mb-1 text-muted-foreground text-xs">
                And {additionalUsers.length} more:
              </p>
              {additionalUsers.map((au) => (
                <Item key={au.userId}>
                  <ItemContent>
                    <ItemTitle>{au.userName}</ItemTitle>
                  </ItemContent>
                </Item>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
