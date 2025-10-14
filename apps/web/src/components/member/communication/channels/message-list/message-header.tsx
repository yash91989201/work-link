import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatMessageDate } from "@/utils/message-utils";

interface MessageHeaderProps {
  sender: {
    name: string;
    email: string;
    image?: string | null | undefined;
  };
  createdAt: Date;
  isEdited?: boolean;
  isPinned?: boolean;
}

export function MessageHeader({
  sender,
  createdAt,
  isEdited,
  isPinned,
}: MessageHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-10 w-10">
        <AvatarImage alt={sender.name} src={sender.image || undefined} />
        <AvatarFallback className="bg-primary/10 font-semibold text-primary">
          {sender.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-1 items-baseline gap-2">
        <span className="font-semibold text-foreground">{sender.name}</span>
        <span className="text-muted-foreground text-xs">
          {formatMessageDate(createdAt)}
        </span>
        {isEdited && (
          <Badge className="text-xs" variant="secondary">
            Edited
          </Badge>
        )}
        {isPinned && (
          <Badge className="text-xs" variant="outline">
            Pinned
          </Badge>
        )}
      </div>
    </div>
  );
}
