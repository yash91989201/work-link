import { Paperclip } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useMessageMutations } from "@/hooks/communications/use-message-mutations";
import { useTypingIndicator } from "@/hooks/communications/use-typing-indicator";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { cn } from "@/lib/utils";
import { orpcClient } from "@/utils/orpc";
import { ComposerActions } from "./composer-actions";
import { HelpText } from "./help-text";
import { TiptapEditor } from "./tiptap-editor";
import { TypingIndicator } from "./typing-indicator";

interface MessageComposerProps {
  channelId: string;
  className?: string;
  parentMessageId?: string;
  placeholder?: string;
  showHelpText?: boolean;
  onSendSuccess?: () => void;
}

export function MessageComposer({
  channelId,
  className,
  parentMessageId,
  placeholder = "Type a message...",
  showHelpText = true,
  onSendSuccess,
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
        const { users = [] } =
          await orpcClient.communication.message.searchUsers({
            channelId,
            query,
            limit: 10,
          });

        return users;
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

      while (true) {
        match = mentionRegex.exec(text);
        if (match === null) break;
        mentionUserIds.push(match[1]);
      }

      await createMessage({
        channelId,
        content: text.trim(),
        mentions: mentionUserIds.length > 0 ? mentionUserIds : undefined,
        parentMessageId,
      });

      setText("");

      broadcastTyping(false, user.name);

      onSendSuccess?.();

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
    user.name,
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

  const handleDrop = useCallback(() => {
    // Let TipTap handle image drops inside the editor
    setIsDragging(false);
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

      {/** biome-ignore lint/a11y/noNoninteractiveElementInteractions: <required here> */}
      {/** biome-ignore lint/a11y/noStaticElementInteractions: <required here> */}
      <div
        className={cn("relative border-t bg-background", className)}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-primary border-dashed bg-primary/5">
            <div className="text-center">
              <Paperclip className="mx-auto h-12 w-12 text-primary" />
              <p className="mt-2 font-medium text-primary">
                Drop files to upload
              </p>
            </div>
          </div>
        )}

        <div>
          <div className="relative">
            {typingUsers.length > 0 && (
              <div className="border-b px-4 py-2">
                <TypingIndicator typingUsers={typingUsers} />
              </div>
            )}

            <TiptapEditor
              content={text}
              disabled={isCreatingMessage}
              fetchUsers={fetchUsers}
              onChange={handleMarkdownChange}
              onSubmit={handleSubmit}
              placeholder={placeholder}
            />

            <div className="border-t p-3">
              <ComposerActions
                isCreatingMessage={isCreatingMessage}
                isRecording={isRecording}
                onEmojiSelect={handleEmojiSelect}
                onFileUpload={handleFileUpload}
                onSubmit={handleSubmit}
                onVoiceRecord={handleVoiceRecord}
                text={text}
              />
            </div>
          </div>

          {showHelpText && <HelpText />}
        </div>
      </div>
    </>
  );
}
