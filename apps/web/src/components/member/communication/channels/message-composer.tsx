import { MoreHorizontal, Paperclip, Send, Smile } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useMessages } from "@/hooks/communications";
import { cn } from "@/lib/utils";

interface MessageComposerProps {
  channelId: string;
  className?: string;
}

export const MessageComposer = ({
  channelId,
  className,
}: MessageComposerProps) => {
  const [message, setMessage] = useState("");
  const { createMessage, isCreatingMessage } = useMessages(channelId);

  const handleSubmit = async () => {
    const content = message.trim();
    if (!content) {
      return;
    }

    try {
      await createMessage({
        channelId,
        content,
      });
      setMessage("");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send message";
      toast(errorMessage);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn("flex-shrink-0 border-t bg-background", className)}>
      <div className="p-4">
        <div className="flex items-end gap-2">
          <div className="flex items-center gap-1">
            <Button
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              size="icon"
              variant="ghost"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                  size="icon"
                  variant="ghost"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-2" side="top">
                <div className="py-4 text-center text-muted-foreground text-sm">
                  Emoji picker coming soon! 😊
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="relative flex-1">
            <Textarea
              className="max-h-32 min-h-[48px] resize-none border-muted bg-muted/50 pr-10 focus:bg-background"
              disabled={isCreatingMessage}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a message..."
              value={message}
            />
            <div className="absolute right-2 bottom-2">
              <span className="text-muted-foreground text-xs">
                {message.length}/2000
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              size="icon"
              variant="ghost"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <Button
              className="h-9 w-9"
              disabled={isCreatingMessage || message.trim().length === 0}
              onClick={() => handleSubmit()}
              size="icon"
            >
              {isCreatingMessage ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-muted-foreground text-xs">
          <div className="flex items-center gap-2">
            <span>Press Enter to send, Shift+Enter for new line</span>
          </div>
          <div className="flex items-center gap-2">
            <Button className="h-auto p-0 text-xs" size="sm" variant="ghost">
              Formatting help
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
