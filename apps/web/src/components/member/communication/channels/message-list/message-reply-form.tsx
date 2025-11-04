import { CornerUpLeft, Send, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MentionSuggestions } from "@/components/shared/mention-suggestions";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Textarea } from "@/components/ui/textarea";
import { useMentionInput } from "@/hooks/communications/use-mention-input";
import { extractMentionUserIds, type Mention } from "@/lib/mentions";

interface MessageReplyFormProps {
  channelId: string;
  parentMessage: {
    id: string;
    content: string;
    sender: {
      name: string;
    };
  };
  onSubmit: (
    content: string,
    parentMessageId: string,
    mentions?: string[]
  ) => Promise<void>;
  onCancel: () => void;
}

export function MessageReplyForm({
  channelId,
  parentMessage,
  onSubmit,
  onCancel,
}: MessageReplyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    text,
    setText,
    showSuggestions,
    suggestions,
    selectedIndex,
    isFetchingUsers,
    handleTextChange,
    insertMention,
    handleKeyDown,
  } = useMentionInput(channelId);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const mentionUserIds = extractMentionUserIds(text, suggestions);
      await onSubmit(text.trim(), parentMessage.id, mentionUserIds);
      setText("");
    } finally {
      setIsSubmitting(false);
    }
  }, [text, parentMessage.id, onSubmit, suggestions, isSubmitting, setText]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    const position = e.target.selectionStart;
    handleTextChange(content, position);
  };

  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    // Handle mention suggestions first
    if (handleKeyDown(e)) {
      return;
    }

    // Submit on Shift + Enter
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }

    // Cancel on Escape
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  const handleMentionSelect = (mention: Mention) => {
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
  };

  return (
    <div className="mt-2 space-y-2 rounded-lg border bg-muted/30 p-3">
      <div className="flex items-start gap-2">
        <CornerUpLeft className="mt-1 h-4 w-4 text-muted-foreground" />
        <div className="flex-1 space-y-2">
          <div className="text-muted-foreground text-sm">
            Replying to{" "}
            <span className="font-medium">{parentMessage.sender.name}</span>
          </div>
          <div className="relative">
            <Textarea
              className="min-h-[60px] resize-none bg-background"
              disabled={isSubmitting}
              onChange={handleTextareaChange}
              onKeyDown={handleTextareaKeyDown}
              placeholder="Type your reply..."
              ref={textareaRef}
              value={text}
            />

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

          <div className="flex items-center justify-between">
            <div className="5 flex items-center gap-1">
              <p className="text-muted-foreground text-sm">
                <Kbd>Esc</Kbd>&nbsp;to cancel
              </p>

              <span>•</span>
              <p className="text-muted-foreground text-sm">
                <Kbd>Shift + Enter</Kbd>&nbsp;to save
              </p>
            </div>
            <div className="5 flex items-center gap-1">
              <Button
                disabled={!text.trim() || isSubmitting}
                onClick={handleSubmit}
                size="sm"
                type="button"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <>
                    <Send className="mr-1 h-4 w-4" />
                    Reply
                  </>
                )}
              </Button>
              <Button
                disabled={isSubmitting}
                onClick={onCancel}
                size="sm"
                type="button"
                variant="ghost"
              >
                <X className="mr-1 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
