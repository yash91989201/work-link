import { Check, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MentionSuggestions } from "@/components/shared/mention-suggestions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMentionInput } from "@/hooks/communications/features/use-mention-input";
import { extractMentionUserIds, type Mention } from "@/lib/mentions";

interface MessageEditFormProps {
  messageId: string;
  channelId: string;
  initialContent: string;
  onSave: (
    messageId: string,
    content: string,
    mentions?: string[]
  ) => Promise<void>;
  onCancel: () => void;
}

export function MessageEditForm({
  messageId,
  channelId,
  initialContent,
  onSave,
  onCancel,
}: MessageEditFormProps) {
  const [isSaving, setIsSaving] = useState(false);
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

  // Initialize with message content
  useEffect(() => {
    setText(initialContent);
    textareaRef.current?.focus();
  }, [initialContent, setText]);

  const handleSave = useCallback(async () => {
    if (!text.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const mentionUserIds = extractMentionUserIds(text, suggestions);
      await onSave(messageId, text.trim(), mentionUserIds);
    } finally {
      setIsSaving(false);
    }
  }, [text, messageId, onSave, suggestions, isSaving]);

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

    // Save on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSave();
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
    <div className="relative mt-2 space-y-2">
      <div className="relative">
        <Textarea
          className="min-h-[80px] resize-none"
          disabled={isSaving}
          onChange={handleTextareaChange}
          onKeyDown={handleTextareaKeyDown}
          placeholder="Edit your message..."
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

      <div className="flex items-center gap-2">
        <Button
          disabled={!text.trim() || isSaving}
          onClick={handleSave}
          size="sm"
        >
          {isSaving ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <>
              <Check className="mr-1 h-4 w-4" />
              Save
            </>
          )}
        </Button>
        <Button
          disabled={isSaving}
          onClick={onCancel}
          size="sm"
          variant="outline"
        >
          <X className="mr-1 h-4 w-4" />
          Cancel
        </Button>
        <span className="text-muted-foreground text-xs">
          Escape to cancel • Ctrl+Enter to save
        </span>
      </div>
    </div>
  );
}
