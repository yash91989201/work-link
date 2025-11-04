import type { MessageType, UserType } from "@work-link/db/lib/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MessageContentProps {
  content: string;
  mentions: string[] | null;
  mentionUsers?: UserType[] | null;
}

export const MessageContent = ({
  content,
  mentionUsers,
}: MessageContentProps) => {
  if (!content) return null;

  // Create a map of user IDs to user objects for quick lookup
  const userMap = new Map<string, UserType>();
  if (mentionUsers) {
    for (const user of mentionUsers) {
      userMap.set(user.id, user);
    }
  }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        components={{
          // Custom mention rendering
          span: ({ className, children, ...props }) => {
            if (className === "mention") {
              const userId = (props as any)["data-id"];
              const user = userId ? userMap.get(userId) : null;

              return (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium",
                    user
                      ? "cursor-pointer bg-primary/10 text-primary hover:bg-primary/20"
                      : "bg-muted text-muted-foreground"
                  )}
                  title={
                    user ? `@${user.name || user.email}` : "User not found"
                  }
                  {...props}
                >
                  {children}
                </span>
              );
            }
            return (
              <span className={className} {...props}>
                {children}
              </span>
            );
          },
          // Style other markdown elements
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-bold">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
                {children}
              </code>
            ) : (
              <code className={className}>{children}</code>
            );
          },
          ul: ({ children }) => <ul className="ml-6 list-disc">{children}</ul>,
          ol: ({ children }) => (
            <ol className="ml-6 list-decimal">{children}</ol>
          ),
          li: ({ children }) => <li className="mb-1">{children}</li>,
          a: ({ href, children }) => (
            <a
              className="text-primary underline hover:text-primary/80"
              href={href}
              rel="noopener noreferrer"
              target="_blank"
            >
              {children}
            </a>
          ),
        }}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
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
}: EnhancedMessageContentProps) => (
  <MessageContent
    content={message.content || ""}
    mentions={message.mentions}
    mentionUsers={message.mentionedUsers}
  />
);
