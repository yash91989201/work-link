import { CornerUpLeft } from "lucide-react";

interface MessageThreadPreviewProps {
  parentMessage: {
    content: string | null;
    sender: {
      name: string;
    };
  };
}

export function MessageThreadPreview({
  parentMessage,
}: MessageThreadPreviewProps) {
  return (
    <div className="mb-2 flex items-start gap-2 rounded-md border-l-2 border-primary/30 bg-muted/30 py-1.5 pl-2 pr-3">
      <CornerUpLeft className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{parentMessage.sender.name}</div>
        <div className="line-clamp-2 text-sm text-muted-foreground">
          {parentMessage.content || ""}
        </div>
      </div>
    </div>
  );
}
