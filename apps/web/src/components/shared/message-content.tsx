import { useSuspenseQuery } from "@tanstack/react-query";
import type { MessageType, UserType } from "@work-link/db/lib/types";
import { cn } from "@/lib/utils";
import { queryUtils } from "@/utils/orpc";

interface MessageContentProps {
  content: string;
  mentions: string[] | null;
  mentionUsers?: UserType[] | null;
}

// Parse and render message content with mentions
export const MessageContent = ({
  content,
  mentionUsers,
}: MessageContentProps) => {
  if (!content) return null;

  // Create a map of user names to user objects for quick lookup
  const userMap = new Map<string, UserType>();
  if (mentionUsers) {
    for (const user of mentionUsers) {
      if (user.name) {
        userMap.set(user.name.toLowerCase(), user);
      }
      userMap.set(user.email.toLowerCase(), user);
    }
  }

  const mentionRegex = /@([^\s@]+(?:\s+[^\s@]+)*)/g;
  const parts: Array<{
    type: "text" | "mention";
    content: string;
    value?: string;
    user?: UserType;
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
    <div className="wrap-break-words whitespace-pre-wrap text-foreground text-sm leading-relaxed">
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
              {part.content}
            </span>
          );
        }

        return part.content;
      })}
    </div>
  );
};

interface EnhancedMessageContentProps {
  message: MessageType & {
    sender: UserType;
    mentionedUsers?: UserType[];
  };
}

export const EnhancedMessageContent = ({
  message,
}: EnhancedMessageContentProps) => {
  const { data: mentionUsers } = useSuspenseQuery(
    queryUtils.communication.message.getMentionUsers.queryOptions({
      input: {
        userIds: message.mentions || [],
      },
    })
  );

  return (
    <MessageContent
      content={message.content || ""}
      mentions={message.mentions}
      mentionUsers={mentionUsers}
    />
  );
};
