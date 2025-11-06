import type { MessageWithSenderType } from "@work-link/api/lib/types";
import type { UserType } from "@work-link/db/lib/types";
import DOMPurify from "dompurify";
import parse from "html-react-parser";
import { Download, FileIcon, Maximize2, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface MessageContentProps {
  message: MessageWithSenderType & {
    mentionedUsers?: UserType[] | null;
    attachments?: Array<{
      id: string;
      fileName: string;
      originalName: string;
      fileSize: number;
      mimeType: string;
      type: string;
      url: string | null;
    }>;
  };
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

function AudioPlayer({ url }: { url: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-3">
      {/** biome-ignore lint/a11y/useMediaCaption: <track is not required here> */}
      <audio className="hidden" ref={audioRef} src={url} />
      <Button onClick={togglePlayback} size="icon-sm" variant="ghost">
        {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
      </Button>
      <div className="flex-1">
        <div className="mb-1 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{
              width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
            }}
          />
        </div>
        <p className="text-muted-foreground text-xs">
          {formatTime(currentTime)} / {formatTime(duration)}
        </p>
      </div>
    </div>
  );
}

function VideoPlayer({ url, fileName }: { url: string; fileName: string }) {
  return (
    <div className="relative max-w-2xl overflow-hidden rounded-lg border shadow-sm">
      {/** biome-ignore lint/a11y/useMediaCaption: <track is not required here> */}
      <video
        className="w-full"
        controls
        preload="metadata"
        src={url}
      >
        Your browser does not support the video tag.
      </video>
      <div className="absolute top-2 right-2">
        <Button
          asChild
          className="bg-background/80 backdrop-blur-sm hover:bg-background"
          size="icon-sm"
          variant="ghost"
        >
          <a
            download
            href={url}
            rel="noopener noreferrer"
            target="_blank"
            title="Download video"
          >
            <Download className="size-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}

function ImagePreview({ url, fileName }: { url: string; fileName: string }) {
  return (
    <div className="group relative max-w-md overflow-hidden rounded-lg border shadow-sm">
      <img
        alt={fileName}
        className="max-h-96 w-full object-cover"
        src={url}
      />
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          asChild
          className="bg-background/80 backdrop-blur-sm hover:bg-background"
          size="icon-sm"
          variant="ghost"
        >
          <a
            href={url}
            rel="noopener noreferrer"
            target="_blank"
            title="Open full size"
          >
            <Maximize2 className="size-4" />
          </a>
        </Button>
        <Button
          asChild
          className="bg-background/80 backdrop-blur-sm hover:bg-background"
          size="icon-sm"
          variant="ghost"
        >
          <a
            download
            href={url}
            rel="noopener noreferrer"
            target="_blank"
            title="Download image"
          >
            <Download className="size-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}

export function MessageContent({ message }: MessageContentProps) {
  const hasContent = message.content && message.content.trim().length > 0;
  const hasAttachments = message.attachments && message.attachments.length > 0;

  // For audio-only messages
  if (message.type === "audio" && hasAttachments) {
    const audioAttachment = message.attachments?.find(
      (att) => att.type === "audio"
    );
    if (audioAttachment?.url) {
      return <AudioPlayer url={audioAttachment.url} />;
    }
  }

  // For attachment-only messages
  if (message.type === "attachment" && hasAttachments && !hasContent) {
    return (
      <div className="flex flex-wrap gap-2">
        {message.attachments?.map((attachment) => {
          if (attachment.type === "image" && attachment.url) {
            return (
              <ImagePreview
                fileName={attachment.originalName}
                key={attachment.id}
                url={attachment.url}
              />
            );
          }

          if (attachment.type === "video" && attachment.url) {
            return (
              <VideoPlayer
                fileName={attachment.originalName}
                key={attachment.id}
                url={attachment.url}
              />
            );
          }

          return (
            <div
              className="flex w-fit max-w-sm items-center gap-2 rounded-lg border bg-background p-2.5 shadow-sm transition-colors hover:bg-muted/50"
              key={attachment.id}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <FileIcon className="size-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-sm leading-tight">
                  {attachment.originalName}
                </p>
                <p className="text-muted-foreground text-xs">
                  {formatFileSize(attachment.fileSize)}
                </p>
              </div>
              {attachment.url && (
                <Button
                  asChild
                  className="shrink-0"
                  size="icon-sm"
                  variant="ghost"
                >
                  <a
                    download
                    href={attachment.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Download className="size-4" />
                  </a>
                </Button>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // For text messages (with or without attachments)
  return (
    <div className="flex flex-col gap-3">
      {hasContent && message.content !== null && (
        <div className="ProseMirror prose-sm dark:prose-invert wrapbreak-word whitespace-pre-wrap">
          {parse(DOMPurify.sanitize(message.content))}
        </div>
      )}

      {hasAttachments && (
        <div className="flex flex-wrap gap-2">
          {message.attachments?.map((attachment) => {
            if (attachment.type === "audio" && attachment.url) {
              return <AudioPlayer key={attachment.id} url={attachment.url} />;
            }

            if (attachment.type === "image" && attachment.url) {
              return (
                <ImagePreview
                  fileName={attachment.originalName}
                  key={attachment.id}
                  url={attachment.url}
                />
              );
            }

            if (attachment.type === "video" && attachment.url) {
              return (
                <VideoPlayer
                  fileName={attachment.originalName}
                  key={attachment.id}
                  url={attachment.url}
                />
              );
            }

            return (
              <div
                className="flex w-fit max-w-sm items-center gap-2 rounded-lg border bg-background p-2.5 shadow-sm transition-colors hover:bg-muted/50"
                key={attachment.id}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <FileIcon className="size-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm leading-tight">
                    {attachment.originalName}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatFileSize(attachment.fileSize)}
                  </p>
                </div>
                {attachment.url && (
                  <Button
                    asChild
                    className="shrink-0"
                    size="icon-sm"
                    variant="ghost"
                  >
                    <a
                      download
                      href={attachment.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <Download className="size-4" />
                    </a>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
