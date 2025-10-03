import type { MessageType } from "@server/lib/types";
import { EnhancedMessageContent } from "@/components/shared/message-content";

interface MessageContentProps {
  message: MessageType & {
    sender: { name: string; email: string; image: string | null };
    mentionedUsers?: Array<{
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    }> | null;
  };
}

export function MessageContent({ message }: MessageContentProps) {
  return (
    <div className="mt-1 space-y-2">
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <EnhancedMessageContent message={message} />
      </div>
      {/* Attachments will be implemented in a future update */}
    </div>
  );
}
