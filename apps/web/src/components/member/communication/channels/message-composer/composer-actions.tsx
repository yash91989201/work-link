import { Mic, Paperclip, Send, Smile } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch,
} from "@/components/ui/emoji-picker";
import { InputGroupButton } from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

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
      <InputGroupButton
        aria-label={isRecording ? "Stop recording" : "Start voice message"}
        className="transition-all duration-200"
        onClick={onVoiceRecord}
        size="icon-sm"
        title={isRecording ? "Stop recording" : "Start voice message"}
        variant="ghost"
      >
        <Mic className={cn("size-4", isRecording && "text-red-500")} />
      </InputGroupButton>

      <Popover>
        <PopoverTrigger asChild>
          <InputGroupButton
            className="transition-all duration-200"
            size="icon-sm"
            title="Add emoji (⌘+E)"
            variant="ghost"
          >
            <Smile />
          </InputGroupButton>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 p-0" side="top">
          <EmojiPicker onEmojiSelect={onEmojiSelect}>
            <EmojiPickerSearch className="h-16" placeholder="Search emoji..." />
            <EmojiPickerContent />
            <EmojiPickerFooter />
          </EmojiPicker>
        </PopoverContent>
      </Popover>

      <InputGroupButton
        className="transition-all duration-200"
        onClick={onFileUpload}
        size="icon-sm"
        title="Attach file (⌘+U)"
        variant="ghost"
      >
        <Paperclip className="size-4" />
      </InputGroupButton>

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
