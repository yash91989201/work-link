import { Mic, Paperclip, Send, Smile } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { MentionSuggestions } from "@/components/shared/mention-suggestions";
import { Badge } from "@/components/ui/badge";
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
import { useMentionInput } from "@/hooks/communications/features/use-mention-input";
import { useTypingIndicator } from "@/hooks/communications/realtime/use-typing-indicator";
import { useMessages } from "@/hooks/communications/use-messages-refactored";
import { extractMentionUserIds, type Mention } from "@/lib/mentions";
import { cn } from "@/lib/utils";

interface MessageComposerProps {
  channelId: string;
  className?: string;
}

export function MessageComposer({
  channelId,
  className,
}: MessageComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const { createMessage, isCreatingMessage } = useMessages(channelId);
  const { typingUsers, broadcastTyping } = useTypingIndicator(channelId);

  const {
    text,
    setText,
    cursorPosition,
    setCursorPosition,
    showSuggestions,
    suggestions,
    selectedIndex,
    isFetchingUsers,
    handleTextChange,
    insertMention,
    handleKeyDown,
  } = useMentionInput(channelId);

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const content = e.target.value;
      const position = e.target.selectionStart;

      handleTextChange(content, position);

      // Broadcast typing status
      if (content.trim()) {
        broadcastTyping(true);

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          broadcastTyping(false);
        }, 3000);
      } else {
        broadcastTyping(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    },
    [handleTextChange, broadcastTyping]
  );

  const handleSubmit = useCallback(async () => {
    if (!text.trim() || isCreatingMessage) return;

    try {
      const mentionUserIds = extractMentionUserIds(text, suggestions);

      await createMessage({
        channelId,
        content: text.trim(),
        mentions: mentionUserIds.length > 0 ? mentionUserIds : undefined,
      });

      setText("");
      setCursorPosition(0);
      broadcastTyping(false);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send message"
      );
    }
  }, [
    text,
    channelId,
    createMessage,
    suggestions,
    setText,
    setCursorPosition,
    broadcastTyping,
    isCreatingMessage,
  ]);

  const handleTextareaKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Handle mention suggestions first
      if (handleKeyDown(e)) {
        return;
      }

      // Submit on Enter (without Shift)
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleKeyDown, handleSubmit]
  );

  const handleEmojiSelect = useCallback(
    (emoji: { emoji: string; label: string }) => {
      const newMessage =
        text.slice(0, cursorPosition) +
        emoji.emoji +
        text.slice(cursorPosition);
      setText(newMessage);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newCursorPosition = cursorPosition + emoji.emoji.length;
          textareaRef.current.setSelectionRange(
            newCursorPosition,
            newCursorPosition
          );
          setCursorPosition(newCursorPosition);
        }
      }, 0);
    },
    [text, cursorPosition, setText, setCursorPosition]
  );

  const handleMentionSelect = useCallback(
    (mention: Mention) => {
      const { newCursorPosition } = insertMention(mention);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(
            newCursorPosition,
            newCursorPosition
          );
        }
      }, 0);
    },
    [insertMention]
  );

  const handleFileUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleVoiceRecord = useCallback(() => {
    setIsRecording((prev) => !prev);
    toast.info(isRecording ? "Recording stopped" : "Recording started");
  }, [isRecording]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    toast.info("File upload not implemented yet");
  }, []);

  return (
    <>
      <input
        className="hidden"
        multiple
        onChange={() => toast.info("File upload not implemented yet")}
        ref={fileInputRef}
        type="file"
      />

      <div
        className={cn("border-t bg-background p-4", className)}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-primary border-dashed bg-primary/5">
            <div className="text-center">
              <Paperclip className="mx-auto h-12 w-12 text-primary" />
              <p className="mt-2 font-medium text-primary">
                Drop files to upload
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="text-muted-foreground text-sm">
              {typingUsers.length === 1
                ? "Someone is typing..."
                : `${typingUsers.length} people are typing...`}
            </div>
          )}

          <div className="flex items-end gap-2">
            {/* Left actions */}
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
            </div>

            {/* Message input */}
            <div className="group relative flex-1">
              <Textarea
                className="max-h-40 min-h-[52px] resize-none rounded-lg border-muted bg-background/80 pr-12 shadow-sm backdrop-blur-sm transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary focus:bg-background focus:shadow-md"
                disabled={isCreatingMessage}
                onChange={handleTextareaChange}
                onKeyDown={handleTextareaKeyDown}
                placeholder="Type a message... (@ to mention, / for commands)"
                ref={textareaRef}
                value={text}
              />

              {/* Character count */}
              <Badge
                className="absolute right-2 bottom-2"
                variant={text.length > 2000 ? "destructive" : "secondary"}
              >
                {text.length}/2000
              </Badge>

              {/* Mention suggestions */}
              {showSuggestions && (
                <MentionSuggestions
                  isLoading={isFetchingUsers}
                  isVisible={showSuggestions}
                  onSelect={handleMentionSelect}
                  query=""
                  selectedIndex={selectedIndex}
                  users={suggestions}
                />
              )}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1">
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
              <Button
                className="h-10 w-10 text-muted-foreground transition-all duration-200 hover:bg-accent/50 hover:text-foreground"
                onClick={handleFileUpload}
                size="icon"
                title="Attach file (⌘+U)"
                variant="ghost"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                className={cn(
                  "h-10 w-10 transition-all duration-200",
                  text.trim() && "scale-105 bg-primary hover:bg-primary/90"
                )}
                disabled={isCreatingMessage || text.trim().length === 0}
                onClick={handleSubmit}
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
}
