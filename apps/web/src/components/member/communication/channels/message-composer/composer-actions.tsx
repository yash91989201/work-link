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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ComposerActionsProps {
  isRecording: boolean;
  isCreatingMessage: boolean;
  text: string;
  hasText: boolean;
  hasAttachments: boolean;
  hasAudio: boolean;
  recordingDuration?: number;
  onEmojiSelect: (emoji: { emoji: string; label: string }) => void;
  onFileUpload: () => void;
  onVoiceRecord: () => void;
  onSubmit: () => void;
}

export function ComposerActions({
  isRecording,
  isCreatingMessage,
  text,
  hasText,
  hasAttachments,
  hasAudio,
  onEmojiSelect,
  onFileUpload,
  onVoiceRecord,
  onSubmit,
}: ComposerActionsProps) {
  const canSend = hasText || hasAttachments || hasAudio;
  const isAudioDisabled = hasText;
  const isTextDisabled = hasAudio;

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <InputGroupButton
              aria-label={
                isRecording ? "Stop recording" : "Start voice message"
              }
              className={cn(
                "transition-all duration-200",
                isRecording && "relative"
              )}
              disabled={isAudioDisabled}
              onClick={onVoiceRecord}
              size="icon-sm"
              title={
                isAudioDisabled
                  ? "Clear text to record audio"
                  : isRecording
                    ? "Stop recording"
                    : "Start voice message"
              }
              variant="ghost"
            >
              <Mic
                className={cn(
                  "size-4",
                  isAudioDisabled && "opacity-50",
                  isRecording && "text-red-500"
                )}
              />
            </InputGroupButton>
          </TooltipTrigger>
          {isAudioDisabled && (
            <TooltipContent>
              <p>Clear text to record audio</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      <Popover>
        <PopoverTrigger asChild>
          <InputGroupButton
            className="transition-all duration-200"
            disabled={isTextDisabled}
            size="icon-sm"
            title="Add emoji (⌘+E)"
            variant="ghost"
          >
            <Smile className={cn(isTextDisabled && "opacity-50")} />
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
        variant={text.length > 5000 ? "destructive" : "secondary"}
      >
        {text.length}/5000
      </Badge>

      <InputGroupButton
        className={cn(
          "rounded-full transition-all duration-200",
          canSend && "scale-105 bg-primary hover:bg-primary/90"
        )}
        disabled={isCreatingMessage || !canSend}
        onClick={onSubmit}
        size="icon-sm"
        title="Send message (Shift+Enter)"
        variant={canSend ? "default" : "ghost"}
      >
        {isCreatingMessage ? <Spinner /> : <Send className="h-4 w-4" />}
      </InputGroupButton>
    </div>
  );
}
