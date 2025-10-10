import { Paperclip } from "lucide-react";

interface FileUploadOverlayProps {
  isDragging: boolean;
}

export function FileUploadOverlay({ isDragging }: FileUploadOverlayProps) {
  if (!isDragging) return null;

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-primary border-dashed bg-primary/5">
      <div className="text-center">
        <Paperclip className="mx-auto h-12 w-12 text-primary" />
        <p className="mt-2 font-medium text-primary">Drop files to upload</p>
      </div>
    </div>
  );
}
