import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMessages } from "@/hooks/communications";

interface MessageComposerProps {
  channelId: string;
  className?: string;
}

export const MessageComposer = ({
  channelId,
  className,
}: MessageComposerProps) => {
  const [message, setMessage] = useState("");
  const { createMessage } = useMessages(channelId);

  const isSending = createMessage.isPending;

  const handleSubmit = async () => {
    const content = message.trim();
    if (!content) {
      return;
    }

    try {
      await createMessage.mutateAsync({
        channelId,
        content,
      });
      setMessage("");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send message";
      toast.error(errorMessage);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={className}>
      <div className="flex items-end gap-2 border-t bg-background p-4">
        <Textarea
          className="min-h-[48px] resize-none"
          disabled={isSending}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message"
          value={message}
        />
        <Button
          disabled={isSending || message.trim().length === 0}
          onClick={() => handleSubmit()}
          size="sm"
        >
          {isSending ? "Sending..." : "Send"}
        </Button>
      </div>
    </div>
  );
};
