import { MoreHorizontal, Paperclip, Send, Smile } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { MentionSuggestions } from "@/components/shared/mention-suggestions";
import { Button } from "@/components/ui/button";
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch,
} from "@/components/ui/emoji-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useMessages } from "@/hooks/communications";
import { useChannelMembers } from "@/hooks/communications/use-channel-members";
import { useMentionUsers } from "@/hooks/communications/use-mention-users";
import type { Mention } from "@/lib/mentions";
import {
  extractMentionUserIds,
  getCurrentWord,
  getMentionQuery,
  insertMention,
  isMentionTrigger,
} from "@/lib/mentions";
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
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { createMessage, isCreatingMessage } = useMessages(channelId);
  const { data: channelMembersData } = useChannelMembers(channelId);
  const { data: mentionUsersData } = useMentionUsers(
    channelId,
    mentionQuery,
    showMentionSuggestions
  );

  // Handle mention detection and suggestions
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    const position = e.target.selectionStart;

    setMessage(content);
    setCursorPosition(position);

    // Check if current word is a mention
    const currentWord = getCurrentWord(content, position);

    if (isMentionTrigger(currentWord)) {
      const query = getMentionQuery(currentWord);
      setMentionQuery(query);
      setShowMentionSuggestions(true);
    } else {
      setShowMentionSuggestions(false);
      setMentionQuery("");
    }
  };

  const handleEmojiSelect = (emoji: { emoji: string; label: string }) => {
    const newMessage =
      message.slice(0, cursorPosition) +
      emoji.emoji +
      message.slice(cursorPosition);
    setMessage(newMessage);

    // Focus back to textarea and set cursor position after the emoji
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPosition = cursorPosition + emoji.emoji.length;
        textareaRef.current.setSelectionRange(
          newCursorPosition,
          newCursorPosition
        );
      }
    }, 0);
  };

  // Handle mention selection
  const handleMentionSelect = (mention: Mention) => {
    const result = insertMention(message, cursorPosition, mention);
    setMessage(result.content);
    setShowMentionSuggestions(false);
    setMentionQuery("");

    // Focus back to textarea and set cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          result.newCursorPosition,
          result.newCursorPosition
        );
      }
    }, 0);
  };

  // Hide mention suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowMentionSuggestions(false);
        setMentionQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async () => {
    const content = message.trim();
    if (!content) {
      return;
    }

    try {
      // Extract mentions using the available channel members data
      let mentions: string[] = [];

      // Convert channel members to Mention format
      const channelMentions: Mention[] = (
        channelMembersData?.members || []
      ).map((member) => ({
        id: member.id,
        name: member.name,
        email: member.email,
        image: member.image,
      }));

      mentions = extractMentionUserIds(content, channelMentions);

      await createMessage({
        channelId,
        content,
        mentions: mentions.length > 0 ? mentions : undefined,
      });
      setMessage("");
      setShowMentionSuggestions(false);
      setMentionQuery("");
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
    } else if (event.key === "Escape" && showMentionSuggestions) {
      event.preventDefault();
      setShowMentionSuggestions(false);
      setMentionQuery("");
    }
  };

  return (
    <div
      className={cn("flex-shrink-0 border-t bg-background", className)}
      ref={containerRef}
    >
      <div className="p-4">
        <div className="relative flex items-end gap-2">
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
                  className="text-muted-foreground hover:text-foreground"
                  size="icon"
                  variant="ghost"
                >
                  <Smile />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80 p-0" side="top">
                <EmojiPicker onEmojiSelect={handleEmojiSelect}>
                  <EmojiPickerSearch placeholder="Search emoji..." />
                  <EmojiPickerContent />
                  <EmojiPickerFooter />
                </EmojiPicker>
              </PopoverContent>
            </Popover>
          </div>

          <div className="relative flex-1">
            <Textarea
              className="max-h-32 min-h-[48px] resize-none border-muted bg-muted/50 pr-10 focus:bg-background"
              disabled={isCreatingMessage}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Write a message... (use @ to mention someone)"
              ref={textareaRef}
              value={message}
            />
            <div className="absolute right-2 bottom-2">
              <span className="text-muted-foreground text-xs">
                {message.length}/2000
              </span>
            </div>

            {/* Mention suggestions */}
            <MentionSuggestions
              isVisible={showMentionSuggestions}
              onSelect={handleMentionSelect}
              query={mentionQuery}
              users={mentionUsersData?.users || []}
            />
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
            <span>•</span>
            <span>Use @ to mention team members</span>
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
