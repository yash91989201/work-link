import { Send } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { MentionSuggestions } from "@/components/shared/mention-suggestions";
import { Badge } from "@/components/ui/badge";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { useMentionInput } from "@/hooks/communications/use-mention-input";
import { useMessageMutations } from "@/hooks/communications/use-message-mutations";
import { useTypingIndicator } from "@/hooks/communications/use-typing-indicator";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { extractMentionUserIds, type Mention } from "@/lib/mentions";
import { cn } from "@/lib/utils";
import { FileUploadOverlay } from "./file-upload-overlay";
import { HelpText } from "./help-text";
import { MessageInputActions } from "./message-input-actions";
import { TypingIndicator } from "./typing-indicator";

interface MessageComposerProps {
  channelId: string;
  className?: string;
}

export function MessageComposer({
  channelId,
  className,
}: MessageComposerProps) {
  const { user } = useAuthedSession();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const { createMessage, isCreatingMessage } = useMessageMutations({
    channelId,
  });

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
      if (content.trim() && user?.name) {
        broadcastTyping(true, user.name);

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          broadcastTyping(false, user.name);
        }, 3000);
      } else if (user?.name) {
        broadcastTyping(false, user.name);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    },
    [handleTextChange, broadcastTyping, user?.name]
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
      broadcastTyping(false, user.name);

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
    user?.name,
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
        <FileUploadOverlay isDragging={isDragging} />

        <div className="space-y-3">
          <div className="relative">
            <InputGroup className="shadow-sm backdrop-blur-sm transition-all duration-200">
              {typingUsers.length > 0 && (
                <InputGroupAddon align="block-start" className="border-b">
                  <TypingIndicator typingUsers={typingUsers} />
                </InputGroupAddon>
              )}

              <InputGroupTextarea
                className="max-h-48 min-h-24"
                disabled={isCreatingMessage}
                onChange={handleTextareaChange}
                onKeyDown={handleTextareaKeyDown}
                placeholder="Type a message..."
                ref={textareaRef}
                value={text}
              />

              <InputGroupAddon align="block-end" className="border-t">
                <MessageInputActions
                  isRecording={isRecording}
                  onEmojiSelect={handleEmojiSelect}
                  onFileUpload={handleFileUpload}
                  onVoiceRecord={handleVoiceRecord}
                  text={text}
                />

                <Badge
                  className="ml-auto"
                  variant={text.length > 2000 ? "destructive" : "secondary"}
                >
                  {text.length}/2000
                </Badge>

                <InputGroupButton
                  className={cn(
                    "rounded-full transition-all duration-200",
                    text.trim() && "scale-105 bg-primary hover:bg-primary/90"
                  )}
                  disabled={isCreatingMessage || text.trim().length === 0}
                  onClick={handleSubmit}
                  size="icon-sm"
                  title="Send message (Enter)"
                  variant={text.trim() ? "default" : "ghost"}
                >
                  {isCreatingMessage ? (
                    <Spinner />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>

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

          <HelpText />
        </div>
      </div>
    </>
  );
}
