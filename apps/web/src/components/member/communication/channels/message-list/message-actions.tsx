import { Edit3, Loader2, Pin, Reply, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { cn } from "@/lib/utils";

interface MessageActionsProps {
  messageId: string;
  senderId: string;
  isPinned?: boolean;
  onEdit?: () => void;
  onReply?: () => void;
  onDelete?: () => void;
  onPin?: () => void;
  isDeleting?: boolean;
  isPinning?: boolean;
}

export function MessageActions({
  senderId,
  isPinned,
  onEdit,
  onReply,
  onDelete,
  onPin,
  isDeleting,
  isPinning,
}: MessageActionsProps) {
  const { user } = useAuthedSession();
  const isOwnMessage = user.id === senderId;

  return (
    <div className="absolute top-0 right-2 hidden gap-0.5 rounded-md border bg-background p-1 shadow-sm group-hover:flex">
      {onReply && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="h-7 w-7"
              onClick={onReply}
              size="icon"
              variant="ghost"
            >
              <Reply className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reply</TooltipContent>
        </Tooltip>
      )}

      {isOwnMessage && onEdit && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="h-7 w-7"
              onClick={onEdit}
              size="icon"
              variant="ghost"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit</TooltipContent>
        </Tooltip>
      )}

      {onPin && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className={cn("h-7 w-7", isPinned && "text-primary")}
              onClick={onPin}
              size="icon"
              variant="ghost"
              disabled={isPinning}
            >
              {isPinning ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Pin className={cn("h-3.5 w-3.5", isPinned && "fill-current")} />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isPinning ? "Pinning..." : isPinned ? "Unpin" : "Pin"}
          </TooltipContent>
        </Tooltip>
      )}

      {isOwnMessage && onDelete && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="h-7 w-7 text-destructive hover:bg-destructive/10"
              disabled={isDeleting}
              onClick={onDelete}
              size="icon"
              variant="ghost"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isDeleting ? "Deleting..." : "Delete"}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
