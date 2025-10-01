import { Mic, MoreHorizontal, Paperclip, Send, Smile } from "lucide-react";
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
  const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file drop logic here
  };

  const handleVoiceRecord = () => {
    if (isRecording) {
      // Stop recording logic
      setIsRecording(false);
    } else {
      // Start recording logic
      setIsRecording(true);
    }
  };

  return (
    <>
      <input
        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
        className="hidden"
        multiple
        ref={fileInputRef}
        type="file"
      />

      <div
        aria-label="Message composer with file drop zone"
        className={cn(
          "flex-shrink-0 border-t bg-gradient-to-b from-background to-muted/20 transition-all duration-200",
          isDragging && "border-primary bg-primary/5",
          className
        )}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        ref={containerRef}
      >
        <div className="relative p-4">
          {/* Drag overlay */}
          {isDragging && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-primary border-dashed bg-primary/10 backdrop-blur-sm">
              <div className="text-center">
                <Paperclip className="mx-auto mb-2 h-8 w-8 text-primary" />
                <p className="font-medium text-primary text-sm">
                  Drop files here
                </p>
                <p className="text-muted-foreground text-xs">
                  or click to browse
                </p>
              </div>
            </div>
          )}

          <div className="relative flex items-end gap-3">
            <div className="flex items-center gap-1">
              <Button
                className="h-10 w-10 text-muted-foreground transition-all duration-200 hover:bg-accent/50 hover:text-foreground"
                onClick={handleFileUpload}
                size="icon"
                title="Attach file (⌘+U)"
                variant="ghost"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className="text-muted-foreground transition-all duration-200 hover:bg-accent/50 hover:text-foreground"
                    size="icon"
                    title="Add emoji (⌘+E)"
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

            {/* Message input */}
            <div className="group relative flex-1">
              <Textarea
                className="max-h-40 min-h-[52px] resize-none rounded-lg border-muted bg-background/80 pr-12 shadow-sm backdrop-blur-sm transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary focus:bg-background focus:shadow-md"
                disabled={isCreatingMessage}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message... (@ to mention, / for commands)"
                ref={textareaRef}
                value={message}
              />

              {/* Character count */}
              {message.length > 1000 && (
                <div className="absolute top-2 right-2">
                  <span
                    className={cn(
                      "font-medium text-xs",
                      message.length > 2000
                        ? "text-destructive"
                        : "text-muted-foreground"
                    )}
                  >
                    {message.length}/2000
                  </span>
                </div>
              )}

              {/* Typing indicator */}
              {message && (
                <div className="-top-6 absolute left-0 text-muted-foreground text-xs">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary delay-75" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary delay-150" />
                    typing...
                  </span>
                </div>
              )}

              {/* Mention suggestions */}
              <MentionSuggestions
                isVisible={showMentionSuggestions}
                onSelect={handleMentionSelect}
                query={mentionQuery}
                users={mentionUsersData?.users || []}
              />
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1">
              <Button
                className="h-10 w-10 text-muted-foreground transition-all duration-200 hover:bg-accent/50 hover:text-foreground"
                onClick={handleVoiceRecord}
                size="icon"
                title={isRecording ? "Stop recording" : "Start voice message"}
                variant="ghost"
              >
                <Mic
                  className={cn("size-4.5", isRecording && "text-red-500")}
                />
              </Button>
              <Button
                className="h-10 w-10 text-muted-foreground transition-all duration-200 hover:bg-accent/50 hover:text-foreground"
                size="icon"
                title="More options"
                variant="ghost"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              <Button
                className={cn(
                  "h-10 w-10 transition-all duration-200",
                  message.trim() && "scale-105 bg-primary hover:bg-primary/90"
                )}
                disabled={isCreatingMessage || message.trim().length === 0}
                onClick={() => handleSubmit()}
                size="icon"
                title="Send message (Enter)"
              >
                {isCreatingMessage ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Help text */}
          <div className="mt-3 flex items-center justify-between text-muted-foreground text-xs">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  Enter
                </kbd>
                to send
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  Shift+Enter
                </kbd>
                new line
              </span>
              <span>•</span>
              <span>@ to mention</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                className="h-auto p-0 text-xs hover:text-primary"
                size="sm"
                variant="ghost"
              >
                Markdown supported
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
