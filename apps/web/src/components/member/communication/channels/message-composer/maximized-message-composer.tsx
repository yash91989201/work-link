import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMessageMutations } from "@/hooks/communications/use-message-mutations";
import { useTypingIndicator } from "@/hooks/communications/use-typing-indicator";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { useResponsive } from "@/hooks/use-responsive";
import { cn } from "@/lib/utils";
import { orpcClient } from "@/utils/orpc";
import { ComposerActions } from "../message-composer/composer-actions";
import { TypingIndicator } from "../message-composer/typing-indicator";
import { MessageEditor } from "./message-editor";

interface MaximizedMessageComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelId: string;
  className?: string;
  parentMessageId?: string;
  messageId?: string;
  placeholder?: string;
  initialContent?: string;
  title?: string;
  description?: string;
  onSendSuccess?: (content: string) => void;
  mode?: "create" | "edit";
}

export function MaximizedMessageComposer({
  open,
  onOpenChange,
  channelId,
  className,
  parentMessageId,
  messageId,
  placeholder = "Type a message...",
  initialContent = "",
  title,
  description,
  onSendSuccess,
  mode = "create",
}: MaximizedMessageComposerProps) {
  const { user } = useAuthedSession();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [text, setText] = useState(initialContent);
  const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const { createMessage, isCreatingMessage, updateMessage, isUpdatingMessage } =
    useMessageMutations({ channelId });

  const { typingUsers, broadcastTyping } = useTypingIndicator(channelId);

  const isEditing = mode === "edit" && !!messageId;
  const isLoading = isCreatingMessage || isUpdatingMessage;

  const dialogSizeClasses = cn("flex flex-col p-0", {
    "h-screen w-screen max-w-none rounded-none": isMobile,
    "max-h-[90vh] sm:max-w-[90vw] sm:max-w-[95vw]": isTablet,
    "h-[90vh] sm:max-w-[90vw] lg:h-[80vh] lg:max-w-[80vw]": isDesktop,
  });

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
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
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
    if (!text.trim() || isLoading) return;

    try {
      const mentionRegex =
        /<span[^>]*data-type="mention"[^>]*data-id="([^"]+)"[^>]*>/g;
      const mentionUserIds: string[] = [];
      let match: RegExpExecArray | null;

      while (true) {
        match = mentionRegex.exec(text);
        if (match === null) break;
        mentionUserIds.push(match[1]);
      }

      if (isEditing && messageId) {
        await updateMessage({
          messageId,
          content: text.trim(),
          mentions: mentionUserIds.length ? mentionUserIds : undefined,
        });
      } else {
        await createMessage({
          channelId,
          content: text.trim(),
          mentions: mentionUserIds.length ? mentionUserIds : undefined,
          parentMessageId,
        });
      }

      setText("");
      onOpenChange(false);
      broadcastTyping(false, user.name);
      onSendSuccess?.(text.trim());

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${isEditing ? "update" : "send"} message`
      );
    }
  }, [
    text,
    isLoading,
    isEditing,
    messageId,
    channelId,
    parentMessageId,
    user?.name,
    onOpenChange,
    onSendSuccess,
    updateMessage,
    createMessage,
    broadcastTyping,
  ]);

  const handleEmojiSelect = useCallback(
    (emoji: { emoji: string }) => setText((prev) => prev + emoji.emoji),
    []
  );

  const handleFileUpload = useCallback(() => fileInputRef.current?.click(), []);

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

  const handleDrop = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (open) {
      setText(initialContent);
    }
  }, [open, initialContent]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className={cn(dialogSizeClasses, className)}
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader className="shrink-0 border-b px-4 py-3 sm:px-6 sm:py-4">
          <DialogTitle className="truncate text-base sm:text-lg">
            {title ||
              (isEditing
                ? "Edit Message"
                : parentMessageId
                  ? "Reply to Message"
                  : "New Message")}
          </DialogTitle>

          {description && (
            <DialogDescription className="text-sm sm:text-base">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/** biome-ignore lint/a11y/noNoninteractiveElementInteractions: <required here> */}
        {/** biome-ignore lint/a11y/noStaticElementInteractions: <required here> */}
        <div
          className="flex flex-1 flex-col overflow-hidden"
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-primary border-dashed bg-primary/5">
              <p className="font-medium text-muted-foreground">
                Drop files to upload
              </p>
            </div>
          )}

          {typingUsers.length > 0 && (
            <div className="border-b px-4 py-2 sm:px-6">
              <TypingIndicator typingUsers={typingUsers} />
            </div>
          )}

          <div className="flex flex-1 flex-col overflow-hidden">
            <MessageEditor
              content={text}
              disabled={isLoading}
              fetchUsers={fetchUsers}
              isMaximized
              onChange={handleMarkdownChange}
              onMaximize={() => onOpenChange(false)}
              onMinimize={() => onOpenChange(false)}
              onSubmit={handleSubmit}
              placeholder={placeholder}
            />

            <div className="border-t px-4 py-3 sm:px-6">
              <ComposerActions
                isCreatingMessage={isLoading}
                isRecording={isRecording}
                onEmojiSelect={handleEmojiSelect}
                onFileUpload={handleFileUpload}
                onSubmit={handleSubmit}
                onVoiceRecord={handleVoiceRecord}
                text={text}
              />
            </div>
          </div>
        </div>

        <input
          className="hidden"
          multiple
          onChange={() => toast.info("File upload not implemented yet")}
          ref={fileInputRef}
          type="file"
        />
      </DialogContent>
    </Dialog>
  );
}
