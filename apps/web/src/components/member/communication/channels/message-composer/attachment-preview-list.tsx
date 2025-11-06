import { FileIcon, FileText, Image, Video, X } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface AttachmentPreview {
  file: File;
  id: string;
  previewUrl?: string;
}

interface AttachmentPreviewListProps {
  attachments: AttachmentPreview[];
  onRemove: (id: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

function AttachmentCard({
  attachment,
  onRemove,
}: {
  attachment: AttachmentPreview;
  onRemove: () => void;
}) {
  const isImage = attachment.file.type.startsWith("image/");
  const isVideo = attachment.file.type.startsWith("video/");
  const isDocument = !isImage && !isVideo;

  const previewUrl = useMemo(() => {
    if (isImage || isVideo) {
      return URL.createObjectURL(attachment.file);
    }
    return null;
  }, [attachment.file, isImage, isVideo]);

  return (
    <div className="relative flex shrink-0 flex-col overflow-hidden rounded-lg border bg-muted/30">
      <Button
        className="absolute top-1 right-1 z-10 size-6 rounded-full bg-background/80 p-0 shadow-sm hover:bg-background"
        onClick={onRemove}
        size="icon-sm"
        variant="ghost"
      >
        <X className="size-3" />
      </Button>

      {isImage && previewUrl && (
        <div className="relative h-32 w-40 overflow-hidden bg-muted">
          <img
            alt={attachment.file.name}
            className="h-full w-full object-cover"
            src={previewUrl}
          />
        </div>
      )}

      {isVideo && previewUrl && (
        <div className="relative flex h-32 w-40 items-center justify-center bg-muted">
          <Video className="size-8 text-muted-foreground" />
        </div>
      )}

      {isDocument && (
        <div className="flex h-32 w-40 items-center justify-center bg-muted">
          <FileText className="size-12 text-muted-foreground" />
        </div>
      )}

      <div className="flex-1 border-t bg-background p-2">
        <p className="truncate font-medium text-xs" title={attachment.file.name}>
          {attachment.file.name}
        </p>
        <p className="text-muted-foreground text-xs">
          {formatFileSize(attachment.file.size)}
        </p>
      </div>
    </div>
  );
}

export function AttachmentPreviewList({
  attachments,
  onRemove,
}: AttachmentPreviewListProps) {
  if (attachments.length === 0) return null;

  return (
    <div className="border-b bg-muted/20 p-3">
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-2">
          {attachments.map((attachment) => (
            <AttachmentCard
              attachment={attachment}
              key={attachment.id}
              onRemove={() => onRemove(attachment.id)}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
