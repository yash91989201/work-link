import type { MessageType } from "@server/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMentionUsersDetails } from "@/hooks/communications/use-mention-users-details";
import { cn } from "@/lib/utils";

interface Mention {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface MessageContentProps {
  content: string;
  mentions: string[] | null;
  mentionUsers?: Mention[] | null;
}

// Parse and render message content with mentions
export const MessageContent = ({
  content,
  mentionUsers,
}: MessageContentProps) => {
  if (!content) return null;

  // Create a map of user names to user objects for quick lookup
  const userMap = new Map<string, Mention>();
  if (mentionUsers) {
    for (const user of mentionUsers) {
      if (user.name) {
        userMap.set(user.name.toLowerCase(), user);
      }
      userMap.set(user.email.toLowerCase(), user);
    }
  }

  const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
  const parts: Array<{
    type: "text" | "mention";
    content: string;
    value?: string;
    user?: Mention;
  }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null = mentionRegex.exec(content);
  while (match !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: content.slice(lastIndex, match.index),
      });
    }
    // Add the mention
    const mentionValue = match[1];
    const user = userMap.get(mentionValue.toLowerCase());
    parts.push({
      type: "mention",
      content: match[0],
      value: mentionValue,
      user,
    });
    lastIndex = match.index + match[0].length;
    match = mentionRegex.exec(content);
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({
      type: "text",
      content: content.slice(lastIndex),
    });
  }

  return (
    <div className="whitespace-pre-wrap break-words text-foreground text-sm leading-relaxed">
      {parts.map((part, index) => {
        if (part.type === "mention") {
          return (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium",
                part.user
                  ? "cursor-pointer bg-primary/10 text-primary hover:bg-primary/20"
                  : "bg-muted text-muted-foreground"
              )}
              key={index.toString()}
              title={
                part.user
                  ? `@${part.user.name || part.user.email}`
                  : `@${part.value} (User not found)`
              }
            >
              <Avatar className="h-4 w-4">
                <AvatarImage
                  alt={part.user?.name || "User"}
                  src={part.user?.image || undefined}
                />
                <AvatarFallback className="text-[10px]">
                  {(part.user?.name || "U").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {part.content}
            </span>
          );
        }

        return part.content;
      })}
    </div>
  );
};

// Enhanced message content with real user data for mentions
interface EnhancedMessageContentProps {
  message: MessageType & {
    sender: { name: string; email: string; image: string | null };
    mentionedUsers?: Mention[] | null;
  };
}

export const EnhancedMessageContent = ({
  message,
}: EnhancedMessageContentProps) => {
  const { data: mentionUsers } = useMentionUsersDetails(message.mentions);

  return (
    <MessageContent
      content={message.content || ""}
      mentions={message.mentions}
      mentionUsers={mentionUsers}
    />
  );
};
