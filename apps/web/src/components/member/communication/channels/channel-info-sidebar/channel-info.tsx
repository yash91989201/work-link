import { Info } from "lucide-react";

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

export const ChannelInfo = ({
  createdByName,
  createdAt,
  messageCount,
  lastMessageAt,
  channelDescription,
}: {
  channelDescription: string;
  createdByName: string;
  createdAt: Date;
  messageCount: number;
  lastMessageAt: Date;
}) => {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Info className="h-4 w-4 text-muted-foreground" />
        <h4 className="font-medium text-foreground text-sm">Channel Details</h4>
      </div>
      <div className="space-y-3 text-sm">
        <p className="text-muted-foreground text-sm leading-relaxed">
          {channelDescription}
        </p>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Created by</span>
          <span className="font-medium text-foreground">{createdByName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Created</span>
          <span className="font-medium text-foreground">
            {createdAt.toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Messages</span>
          <span className="font-medium text-foreground">
            {messageCount.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Last Activity</span>
          <span className="font-medium text-foreground">
            {formatRelativeTime(lastMessageAt)}
          </span>
        </div>
      </div>
    </div>
  );
};
