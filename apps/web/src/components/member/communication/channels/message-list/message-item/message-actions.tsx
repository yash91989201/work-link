import { Edit3, Pin, Reply, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";
import { ReactionPicker } from "./reaction-picker";

interface MessageActionsProps {
  canEdit: boolean;
  isPinned: boolean;
  isOwnMessage: boolean;
  canReply: boolean;
  onEdit: () => void;
  onReply: () => void;
  onDelete: () => void;
  onPin: () => void;
  onReact: (emoji: string) => void;
}

export function MessageActions({
  isOwnMessage,
  canEdit,
  isPinned,
  canReply,
  onEdit,
  onReply,
  onDelete,
  onPin,
  onReact,
}: MessageActionsProps) {
  return (
    <ButtonGroup className="pointer-events-none absolute top-0.5 right-3 z-10 rounded-lg bg-popover/95 opacity-0 backdrop-blur transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 supports-backdrop-filter:bg-popover/75">
      {canReply && (
        <Button
          aria-label="Reply"
          onClick={onReply}
          size="icon-sm"
          title="Reply to Message"
          variant="ghost"
        >
          <Reply className="h-3.5 w-3.5" />
        </Button>
      )}

      <ReactionPicker onSelectEmoji={onReact} />

      {canEdit && (
        <Button
          aria-label="Edit"
          onClick={onEdit}
          size="icon-sm"
          title="Edit Message"
          variant="ghost"
        >
          <Edit3 className="h-3.5 w-3.5" />
        </Button>
      )}

      <Button
        aria-label={isPinned ? "UnPin message" : "Pin message"}
        className={cn({ "text-primary": isPinned })}
        onClick={onPin}
        size="icon-sm"
        title={isPinned ? "Unpin message" : "Pin message"}
        variant="ghost"
      >
        <Pin className={cn({ "fill-current": isPinned })} />
      </Button>

      {isOwnMessage && (
        <Button
          aria-label="Delete message"
          onClick={onDelete}
          size="icon-sm"
          title="Delete message"
          variant="ghost"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </ButtonGroup>
  );
}
