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
    <div className="mb-2 flex items-start gap-2 rounded-lg border-l-2 border-primary/40 bg-muted/40 py-1.5 pr-3 pl-2">
      <CornerUpLeft className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="font-medium text-sm">{parentMessage.sender.name}</div>
        <div className="line-clamp-2 text-muted-foreground text-sm">
          {parentMessage.content || ""}
        </div>
      </div>
    </div>
  );
}
