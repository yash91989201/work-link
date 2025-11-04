import { Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InputGroupButton } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { MessageInputActions } from "./message-input-actions";

interface ComposerActionsProps {
  isRecording: boolean;
  isCreatingMessage: boolean;
  text: string;
  onEmojiSelect: (emoji: { emoji: string; label: string }) => void;
  onFileUpload: () => void;
  onVoiceRecord: () => void;
  onSubmit: () => void;
}

export function ComposerActions({
  isRecording,
  isCreatingMessage,
  text,
  onEmojiSelect,
  onFileUpload,
  onVoiceRecord,
  onSubmit,
}: ComposerActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <MessageInputActions
        isRecording={isRecording}
        onEmojiSelect={onEmojiSelect}
        onFileUpload={onFileUpload}
        onVoiceRecord={onVoiceRecord}
        text={text}
      />

      <Badge className="ml-auto" variant={text.length > 2000 ? "destructive" : "secondary"}>
        {text.length}/2000
      </Badge>

      <InputGroupButton
        className={cn(
          "rounded-full transition-all duration-200",
          text.trim() && "scale-105 bg-primary hover:bg-primary/90"
        )}
        disabled={isCreatingMessage || text.trim().length === 0}
        onClick={onSubmit}
        size="icon-sm"
        title="Send message (Shift+Enter)"
        variant={text.trim() ? "default" : "ghost"}
      >
        {isCreatingMessage ? <Spinner /> : <Send className="h-4 w-4" />}
      </InputGroupButton>
    </div>
  );
}
