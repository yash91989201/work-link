import { Edit3, Pin, Reply, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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
  onEdit: () => void;
  onReply: () => void;
  onDelete: () => void;
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
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="size-7"
            onClick={onReply}
            size="icon"
            variant="ghost"
          >
            <Reply className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Reply</TooltipContent>
      </Tooltip>

      {isOwnMessage && (
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

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className={cn("size-7", isPinned && "text-primary")}
            disabled={isPinning}
            onClick={onPin}
            size="icon"
            variant="ghost"
          >
            {isPinning ? (
              <Spinner className="size-3.5" />
            ) : (
              <Pin className={cn("size-3.5", isPinned && "fill-current")} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isPinned ? "Unpin" : "Pin"}</TooltipContent>
      </Tooltip>

      {isOwnMessage && (
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
                <Spinner className="size-3.5" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isDeleting ? "Deleting..." : "Delete"}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
