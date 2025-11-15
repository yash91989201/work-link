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
}: MaximizedMessageComposerProps) {
  const isEditing = !!messageId;
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { user } = useAuthedSession();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const [text, setText] = useState(initialContent);

  const { createMessage, replyMessage, updateMessage } = useMessageMutations();

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

  const handleSubmit = useCallback(() => {
    if (!text.trim()) return;

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

      if (isEditing) {
        updateMessage({
          message: {
            messageId,
            content: text.trim(),
            mentions: mentionUserIds.length ? mentionUserIds : undefined,
          },
        });
      } else {
        const messageData = {
          channelId,
          content: text.trim(),
          mentions: mentionUserIds.length ? mentionUserIds : undefined,
          parentMessageId,
          type: "text" as const,
        };

        if (parentMessageId) {
          replyMessage({ message: messageData });
        } else {
          createMessage({ message: messageData });
        }
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
    isEditing,
    messageId,
    channelId,
    parentMessageId,
    user?.name,
    onOpenChange,
    onSendSuccess,
    updateMessage,
    createMessage,
    replyMessage,
    broadcastTyping,
  ]);

  useEffect(() => {
    if (open) {
      setText(initialContent);
    }
  }, [open, initialContent]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className={cn(
          "flex flex-col overflow-y-auto p-0",
          {
            "h-screen w-screen max-w-none rounded-none": isMobile,
            "max-h-[90vh] sm:max-w-[90vw]": isTablet,
            "h-[90vh] sm:max-w-[90vw] lg:h-[80vh] lg:max-w-[80vw]": isDesktop,
          },
          className
        )}
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

        <div className="flex flex-1 flex-col overflow-hidden">
          {typingUsers.length > 0 && (
            <div className="border-b px-4 py-2 sm:px-6">
              <TypingIndicator typingUsers={typingUsers} />
            </div>
          )}

          <div className="flex flex-1 flex-col overflow-hidden">
            <MessageEditor
              content={text}
              disabled={false}
              fetchUsers={fetchUsers}
              isInMaximizedComposer={true}
              isMaximized
              onChange={handleMarkdownChange}
              onMaximize={() => onOpenChange(false)}
              onMinimize={() => onOpenChange(false)}
              onSubmit={handleSubmit}
              placeholder={placeholder}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
