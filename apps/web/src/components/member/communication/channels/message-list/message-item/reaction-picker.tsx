import { EmojiPicker as FrimousseEmojiPicker } from "frimousse";
import { Smile } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ReactionPickerProps {
  onSelectEmoji: (emoji: string) => void;
}

const QUICK_REACTIONS = ["👍", "❤", "😂", "🎉", "🚀", "👀", "✅", "🔥"];

export function ReactionPicker({ onSelectEmoji }: ReactionPickerProps) {
  const [open, setOpen] = useState(false);

  const handleEmojiSelect = (emoji: { emoji: string }) => {
    onSelectEmoji(emoji.emoji);
    setOpen(false);
  };

  const handleQuickReaction = (emoji: string) => {
    onSelectEmoji(emoji);
    setOpen(false);
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button size="icon-sm" type="button" variant="ghost">
          <Smile />
          <span className="sr-only">Add reaction</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        alignOffset={-8}
        className="w-auto border-none p-0 shadow-lg"
        side="left"
        sideOffset={8}
      >
        <div className="flex flex-col gap-2 p-2">
          {/* Quick reactions */}
          <div className="flex gap-1">
            {QUICK_REACTIONS.map((emoji) => (
              <Button
                className="h-8 w-8 p-0 text-lg hover:scale-110"
                key={emoji}
                onClick={() => handleQuickReaction(emoji)}
                size="sm"
                type="button"
                variant="ghost"
              >
                {emoji}
              </Button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-border border-t" />

          {/* Full emoji picker */}
          <FrimousseEmojiPicker.Root onEmojiSelect={handleEmojiSelect}>
            <FrimousseEmojiPicker.Search placeholder="Search emoji..." />
            <FrimousseEmojiPicker.Viewport className="h-[280px]">
              <FrimousseEmojiPicker.List />
            </FrimousseEmojiPicker.Viewport>
          </FrimousseEmojiPicker.Root>
        </div>
      </PopoverContent>
    </Popover>
  );
}
