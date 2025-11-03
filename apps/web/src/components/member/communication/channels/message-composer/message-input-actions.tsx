import { Mic, Paperclip, Smile } from "lucide-react";
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
    <div className="flex items-center gap-1.5">
      <Button
        aria-label={isRecording ? "Stop recording" : "Start voice message"}
        className="h-10 w-10 text-muted-foreground transition-all duration-200 hover:bg-accent/50 hover:text-foreground"
        onClick={onVoiceRecord}
        size="icon"
        title={isRecording ? "Stop recording" : "Start voice message"}
        variant="ghost"
      >
        <Mic className={cn("size-4.5", isRecording && "text-red-500")} />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            className="size-10 text-muted-foreground transition-all duration-200 hover:bg-accent/50 hover:text-foreground"
            size="icon"
            title="Add emoji (⌘+E)"
            variant="ghost"
          >
            <Smile />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 p-0" side="top">
          <EmojiPicker onEmojiSelect={onEmojiSelect}>
            <EmojiPickerSearch className="h-16" placeholder="Search emoji..." />
            <EmojiPickerContent />
            <EmojiPickerFooter />
          </EmojiPicker>
        </PopoverContent>
      </Popover>

      <Button
        className="size-10 text-muted-foreground transition-all duration-200 hover:bg-accent/50 hover:text-foreground"
        onClick={onFileUpload}
        size="icon"
        title="Attach file (⌘+U)"
        variant="ghost"
      >
        <Paperclip className="h-4 w-4" />
      </Button>
    </div>
  );
}
