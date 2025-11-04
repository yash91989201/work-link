import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useMessageMutations } from "@/hooks/communications/use-message-mutations";
import { useTypingIndicator } from "@/hooks/communications/use-typing-indicator";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { cn } from "@/lib/utils";
import { queryUtils } from "@/utils/orpc";
import { FileUploadOverlay } from "./file-upload-overlay";
import { HelpText } from "./help-text";
import { MarkdownEditor } from "./markdown-editor";

interface MessageComposerProps {
  channelId: string;
  className?: string;
}

export function MessageComposer({
  channelId,
  className,
}: MessageComposerProps) {
  const { user } = useAuthedSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const { createMessage, isCreatingMessage } = useMessageMutations({
    channelId,
  });

  const { typingUsers, broadcastTyping } = useTypingIndicator(channelId);

  const fetchUsers = useCallback(
    async (query: string) => {
      try {
        const { data } =
          await queryUtils.communication.message.searchUsers.query({
            channelId,
            query,
            limit: 10,
          });
        return data?.users || [];
      } catch (error) {
        console.error("Error fetching mention users:", error);
        return [];
      }
    },
    [channelId]
  );

  const handleTypingBroadcast = useCallback(
    (content: string) => {
      if (!user?.name) return;

      if (content.trim()) {
        broadcastTyping(true, user.name);

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          broadcastTyping(false, user.name);
        }, 3000);
      } else {
        broadcastTyping(false, user.name);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    },
    [broadcastTyping, user?.name]
  );

  const handleMarkdownChange = useCallback(
    (content: string) => {
      setText(content);
      handleTypingBroadcast(content);
    },
    [handleTypingBroadcast]
  );

  const handleSubmit = useCallback(async () => {
    if (!text.trim() || isCreatingMessage) return;

    try {
      // Extract mention user IDs from HTML content
      const mentionRegex =
        /<span[^>]*data-type="mention"[^>]*data-id="([^"]+)"[^>]*>/g;
      const mentionUserIds: string[] = [];
      let match: RegExpExecArray | null;

      while ((match = mentionRegex.exec(text)) !== null) {
        mentionUserIds.push(match[1]);
      }

      await createMessage({
        channelId,
        content: text.trim(),
        mentions: mentionUserIds.length > 0 ? mentionUserIds : undefined,
      });

      setText("");

      if (user?.name) {
        broadcastTyping(false, user.name);
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send message"
      );
    }
  }, [
    text,
    channelId,
    createMessage,
    broadcastTyping,
    isCreatingMessage,
    user?.name,
  ]);

  const handleEmojiSelect = useCallback(
    (emoji: { emoji: string; label: string }) => {
      // Insert emoji at the end for now (can be enhanced later)
      const newMessage = text + emoji.emoji;
      setText(newMessage);
    },
    [text]
  );

  const handleFileUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleVoiceRecord = useCallback(() => {
    setIsRecording((prev) => !prev);
    toast.info(isRecording ? "Recording stopped" : "Recording started");
  }, [isRecording]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    toast.info("File upload not implemented yet");
  }, []);

  return (
    <>
      <input
        className="hidden"
        multiple
        onChange={() => toast.info("File upload not implemented yet")}
        ref={fileInputRef}
        type="file"
      />

      <div
        className={cn("border-t bg-background p-4", className)}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <FileUploadOverlay isDragging={isDragging} />

        <div className="space-y-3">
          <div className="relative">
            <MarkdownEditor
              fetchUsers={fetchUsers}
              isCreatingMessage={isCreatingMessage}
              isRecording={isRecording}
              onEmojiSelect={handleEmojiSelect}
              onFileUpload={handleFileUpload}
              onSubmit={handleSubmit}
              onTextChange={handleMarkdownChange}
              onVoiceRecord={handleVoiceRecord}
              text={text}
              typingUsers={typingUsers}
            />
          </div>

          <HelpText />
        </div>
      </div>
    </>
  );
}
