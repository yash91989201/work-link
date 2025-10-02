import { Pin } from "lucide-react";

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

export const PinnedMessages = ({
  pinnedMessages,
}: {
  pinnedMessages: {
    id: string;
    content: string;
    author: string;
    timestamp: Date;
  }[];
}) => {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Pin className="h-4 w-4 text-muted-foreground" />
        <h4 className="font-medium text-foreground text-sm">Pinned Messages</h4>
      </div>
      <div className="space-y-3">
        {pinnedMessages.map((message) => (
          <div
            className="rounded-lg border border-border/50 bg-muted/30 p-3"
            key={message.id}
          >
            <div className="mb-1 flex items-start gap-2">
              <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                <span className="font-medium text-primary text-xs">
                  {getInitials(message.author)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-medium text-foreground text-sm">
                    {message.author}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {formatRelativeTime(message.timestamp)}
                  </span>
                </div>
                <p className="line-clamp-2 text-muted-foreground text-sm">
                  {message.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
