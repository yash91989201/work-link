import { useMessages } from "@/hooks/communications/use-messages";
import { EmptyState } from "./empty-state";
import { MessageItem } from "./message-item";

export function MessageList() {
  const { messages } = useMessages();

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-hidden bg-linear-to-b from-background via-background to-muted/10">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="relative flex-1 overflow-hidden bg-linear-to-b from-background via-background to-muted/10">
      <div className="h-full overflow-auto">
        <div className="flex flex-col py-4 sm:px-4">
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
        </div>
      </div>
    </div>
  );
}
