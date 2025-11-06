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
  messageType?: "text" | "attachment" | "audio";
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
  messageType = "text",
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
  const canEdit = isOwnMessage && messageType === "text";

  return (
    <div className="pointer-events-none absolute top-2 right-3 z-10 flex items-center gap-0.5 rounded-lg border bg-popover/95 p-1 opacity-0 shadow-md backdrop-blur transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 supports-backdrop-filter:bg-popover/75">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label="Reply"
            className="size-7"
            onClick={onReply}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Reply className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Reply</TooltipContent>
      </Tooltip>

      {canEdit && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label="Edit"
              className="size-7"
              onClick={onEdit}
              size="icon"
              type="button"
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
            aria-label={isPinned ? "Unpin" : "Pin"}
            className={cn("size-7", isPinned && "text-primary")}
            disabled={isPinning}
            onClick={onPin}
            size="icon"
            type="button"
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
              aria-label={isDeleting ? "Deleting" : "Delete"}
              className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
              disabled={isDeleting}
              onClick={onDelete}
              size="icon"
              type="button"
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
