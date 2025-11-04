import { Mic, Paperclip, Smile } from "lucide-react";
import { InputGroupButton } from "@/components/ui/input-group";
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
import { cn } from "@/lib/utils";

interface MessageInputActionsProps {
  isRecording: boolean;
  onVoiceRecord: () => void;
  onEmojiSelect: (emoji: { emoji: string; label: string }) => void;
  onFileUpload: () => void;
  text: string;
}

export function MessageInputActions({
  isRecording,
  onVoiceRecord,
  onEmojiSelect,
  onFileUpload,
}: MessageInputActionsProps) {
  return (
    <>
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
    </>
  );
}
