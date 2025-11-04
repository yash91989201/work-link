import type { MessageWithSenderType } from "@work-link/api/lib/types";
import type { UserType } from "@work-link/db/lib/types";
import DOMPurify from "dompurify";
import parse from "html-react-parser";

interface MessageContentProps {
  message: MessageWithSenderType & {
    mentionedUsers?: UserType[] | null;
  };
}

export function MessageContent({ message }: MessageContentProps) {
  if (!message.content) return null;

  const safe = DOMPurify.sanitize(message.content);
  return (
    <div className="ProseMirror prose-sm dark:prose-invert">{parse(safe)}</div>
  );
}
