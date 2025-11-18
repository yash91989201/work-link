import { useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMessageMutations } from "@/hooks/communications/use-message-mutations";
import { useTypingIndicator } from "@/hooks/communications/use-typing-indicator";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { useResponsive } from "@/hooks/use-responsive";
import { cn } from "@/lib/utils";
import { useMaximizedMessageComposer } from "@/stores/channel-store";
import { orpcClient } from "@/utils/orpc";
import { MessageEditor } from "./message-editor";

export function MaximizedMessageComposer() {
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const {
    isOpen,
    content,
    messageId,
    parentMessageId,
    onComplete,
    openMaximizedMessageComposer,
    closeMaximizedMessageComposer,
  } = useMaximizedMessageComposer();

  const isEditing = !!messageId;
  const isReplying = !!parentMessageId;

  const { id: channelId } = useParams({
    from: "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id",
  });

  const { user } = useAuthedSession();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const [text, setText] = useState(content ?? "");

  useEffect(() => {
    if (isOpen) {
      setText(content ?? "");
    }
  }, [content, isOpen]);

  const { createMessage, updateMessage } = useMessageMutations();

  const { broadcastTyping } = useTypingIndicator(channelId);

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

  const handleClose = useCallback(() => {
    onComplete?.({ action: "cancel", content: text });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (user?.name) {
      broadcastTyping(false, user.name);
    }
    closeMaximizedMessageComposer();
  }, [
    onComplete,
    text,
    closeMaximizedMessageComposer,
    broadcastTyping,
    user?.name,
  ]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        handleClose();
      }
    },
    [handleClose]
  );

  const handleGlobalShortcut = useCallback(
    (event: KeyboardEvent) => {
      const isModifierPressed = event.ctrlKey || event.metaKey;
      const isMaximizeShortcut =
        isModifierPressed && event.key.toLowerCase() === "m";

      if (!isMaximizeShortcut) return;

      const target = event.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName;
        const isFormElement =
          tagName === "INPUT" ||
          tagName === "TEXTAREA" ||
          tagName === "SELECT" ||
          tagName === "BUTTON";

        if (isFormElement || target.isContentEditable) {
          return;
        }
      }

      event.preventDefault();
      openMaximizedMessageComposer();
    },
    [openMaximizedMessageComposer]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleGlobalShortcut);

    return () => {
      window.removeEventListener("keydown", handleGlobalShortcut);
    };
  }, [handleGlobalShortcut]);

  const handleSubmit = useCallback(() => {
    if (!text?.trim()) return;

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
        createMessage({
          message: {
            channelId,
            content: text.trim(),
            mentions: mentionUserIds.length ? mentionUserIds : undefined,
            parentMessageId: parentMessageId ?? undefined,
            type: "text" as const,
          },
        });
      }

      setText("");
      onComplete?.({ action: "submit" });
      closeMaximizedMessageComposer();

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (user?.name) {
        broadcastTyping(false, user.name);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${isEditing ? "update" : "send"} message`
      );
    }
  }, [
    user?.name,
    text,
    isEditing,
    parentMessageId,
    messageId,
    channelId,
    updateMessage,
    createMessage,
    onComplete,
    broadcastTyping,
    closeMaximizedMessageComposer,
  ]);

  let dialogTitle = "New Message";
  dialogTitle = isEditing ? "Edit Message" : dialogTitle;
  dialogTitle = isReplying ? "Reply to Message" : dialogTitle;

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogContent
        className={cn("flex flex-col overflow-y-auto p-0", {
          "h-screen w-screen max-w-none rounded-none": isMobile,
          "max-h-[90vh] sm:max-w-[90vw]": isTablet,
          "h-[90vh] sm:max-w-[90vw] lg:h-[80vh] lg:max-w-[80vw]": isDesktop,
        })}
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader className="shrink-0 border-b px-4 py-3 sm:px-6 sm:py-4">
          <DialogTitle className="truncate text-base sm:text-lg">
            {dialogTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 flex-col overflow-hidden">
          <MessageEditor
            content={text}
            disabled={false}
            fetchUsers={fetchUsers}
            isInMaximizedComposer={true}
            isMaximized
            onChange={handleMarkdownChange}
            onMaximize={handleClose}
            onMinimize={handleClose}
            onSubmit={handleSubmit}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
