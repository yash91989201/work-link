import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useMessageMutations } from "@/hooks/communications/use-message-mutations";
import { useTypingIndicator } from "@/hooks/communications/use-typing-indicator";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useMaximizedMessageComposerActions } from "@/stores/channel-store";
import { orpcClient } from "@/utils/orpc";
import { uploadToSupabase } from "@/utils/upload-helper";
import { AttachmentPreviewList } from "./attachment-preview-list";
import { AudioRecorder } from "./audio-recorder";
import { ComposerActions } from "./composer-actions";
import { MessageEditor } from "./message-editor";
import { TypingIndicator } from "./typing-indicator";

interface AttachmentPreview {
  file: File;
  id: string;
  uploadedFileName?: string;
}

interface MessageComposerProps {
  channelId: string;
  className?: string;
  parentMessageId?: string;
  placeholder?: string;
  showHelpText?: boolean;
  onSendSuccess?: () => void;
  onMaximize?: (content: string) => void;
  initialContent?: string;
}

export function MessageComposer({
  channelId,
  className,
  parentMessageId,
  onSendSuccess,
  onMaximize,
  initialContent = "",
}: MessageComposerProps) {
  const { user } = useAuthedSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [text, setText] = useState(initialContent);
  const [isEditorMaximized, setIsEditorMaximized] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  const { openMaximizedMessageComposer } = useMaximizedMessageComposerActions();

  const {
    isRecording,
    audioBlob,
    audioUrl,
    duration,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useAudioRecorder();

  const { createMessage } = useMessageMutations();
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

        return users.filter((su) => su.id !== user.id);
      } catch (error) {
        console.error("Error fetching mention users:", error);
        return [];
      }
    },
    [channelId, user.id]
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
    const hasText = text.trim().length > 0;
    const hasAttachments = attachments.length > 0;
    const hasAudio = audioBlob !== null;

    if (!(hasText || hasAttachments || hasAudio)) return;

    // Clear UI immediately for better UX
    const textToSend = hasText ? text.trim() : undefined;
    const attachmentsToUpload = [...attachments];
    const audioBlobToUpload = audioBlob;

    setText("");
    setAttachments([]);
    cancelRecording();
    broadcastTyping(false, user.name);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    try {
      const mentionRegex =
        /<span[^>]*data-type="mention"[^>]*data-id="([^"]+)"[^>]*>/g;
      const mentionUserIds: string[] = [];
      let match: RegExpExecArray | null;

      while (true) {
        match = mentionRegex.exec(textToSend || "");
        if (match === null) break;
        mentionUserIds.push(match[1]);
      }

      // Determine message type
      let messageType: "text" | "attachment" | "audio" = "text";
      if (!textToSend && audioBlobToUpload) {
        messageType = "audio";
      } else if (!textToSend && attachmentsToUpload.length > 0) {
        messageType = "attachment";
      }

      // Upload attachments and audio in parallel
      const uploadPromises: Promise<any>[] = [];

      if (attachmentsToUpload.length > 0) {
        for (const attachment of attachmentsToUpload) {
          uploadPromises.push(
            uploadToSupabase(
              attachment.file,
              "message-attachment",
              user.id
            ).then((uploaded) => {
              const fileType = attachment.file.type;
              let attachmentType:
                | "image"
                | "document"
                | "video"
                | "audio"
                | "archive" = "document";

              if (fileType.startsWith("image/")) attachmentType = "image";
              else if (fileType.startsWith("video/")) attachmentType = "video";
              else if (fileType.startsWith("audio/")) attachmentType = "audio";
              else if (
                fileType.includes("zip") ||
                fileType.includes("rar") ||
                fileType.includes("7z")
              )
                attachmentType = "archive";

              return {
                fileName: uploaded.fileName,
                originalName: uploaded.originalName,
                fileSize: uploaded.fileSize,
                mimeType: uploaded.mimeType,
                type: attachmentType,
                url: uploaded.url,
              };
            })
          );
        }
      }

      if (audioBlobToUpload) {
        const audioFile = new File(
          [audioBlobToUpload],
          `audio-${Date.now()}.webm`,
          {
            type: "audio/webm",
          }
        );

        uploadPromises.push(
          uploadToSupabase(audioFile, "message-audio", user.id).then(
            (uploaded) => ({
              fileName: uploaded.fileName,
              originalName: uploaded.originalName,
              fileSize: uploaded.fileSize,
              mimeType: uploaded.mimeType,
              type: "audio" as const,
              url: uploaded.url,
            })
          )
        );
      }

      // Wait for all uploads to complete
      const uploadedAttachments =
        uploadPromises.length > 0 ? await Promise.all(uploadPromises) : [];

      const messageData = {
        channelId,
        content: textToSend,
        mentions: mentionUserIds.length > 0 ? mentionUserIds : undefined,
        parentMessageId,
        type: messageType,
        attachments:
          uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
      };

      createMessage({ message: messageData });

      onSendSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send message"
      );
    }
  }, [
    text,
    attachments,
    audioBlob,
    channelId,
    createMessage,
    broadcastTyping,
    user.name,
    user.id,
    parentMessageId,
    onSendSuccess,
    cancelRecording,
  ]);

  const handleEmojiSelect = useCallback(
    (emoji: { emoji: string; label: string }) => {
      // Insert emoji at the end for now (can be enhanced later)
      const newMessage = text + emoji.emoji;
      setText(newMessage);
    },
    [text]
  );

  const handleFileUpload = useCallback((files?: FileList) => {
    const filesToAdd = files || fileInputRef.current?.files;
    if (!filesToAdd) return;

    const newAttachments: AttachmentPreview[] = Array.from(filesToAdd).map(
      (file) => ({
        file,
        id: `${Date.now()}-${Math.random()}`,
      })
    );

    setAttachments((prev) => [...prev, ...newAttachments]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleRemoveAttachment = useCallback(
    async (id: string) => {
      const attachment = attachments.find((att) => att.id === id);

      // If file was already uploaded to Supabase, delete it
      if (attachment?.uploadedFileName) {
        try {
          const { error } = await supabase.storage
            .from("message-attachment")
            .remove([attachment.uploadedFileName]);

          if (error) {
            console.error("Failed to delete attachment from Supabase:", error);
          }
        } catch (error) {
          console.error("Error deleting attachment:", error);
        }
      }

      setAttachments((prev) => prev.filter((att) => att.id !== id));
    },
    [attachments]
  );

  const handleVoiceRecord = useCallback(async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const handleAudioSend = useCallback(() => {
    handleSubmit();
  }, [handleSubmit]);

  const handleAudioCancel = useCallback(() => {
    cancelRecording();
  }, [cancelRecording]);

  const handleMaximize = useCallback(() => {
    if (onMaximize) {
      onMaximize(text);
      return;
    }

    setIsEditorMaximized(true);
    openMaximizedMessageComposer({
      content: text,
      parentMessageId: parentMessageId ?? null,
      onComplete: (result) => {
        setIsEditorMaximized(false);

        if (result.action === "cancel") {
          if (typeof result.content === "string") {
            setText(result.content);
            handleTypingBroadcast(result.content);
          }
          return;
        }

        setText("");
        setAttachments([]);
        cancelRecording();
        if (user?.name) {
          broadcastTyping(false, user.name);
        }
      },
    });
  }, [
    onMaximize,
    text,
    openMaximizedMessageComposer,
    parentMessageId,
    handleTypingBroadcast,
    cancelRecording,
    user?.name,
    broadcastTyping,
  ]);

  // Sync text when initialContent changes (for thread replies)
  useEffect(() => {
    setText(initialContent);
  }, [initialContent]);

  return (
    <>
      <input
        accept="*/*"
        className="hidden"
        multiple
        onChange={(e) => handleFileUpload(e.target.files || undefined)}
        ref={fileInputRef}
        type="file"
      />

      <div className={cn("relative border-t bg-background", className)}>
        <div>
          <div className="relative">
            {typingUsers.length > 0 && (
              <div className="border-b px-4 py-2">
                <TypingIndicator typingUsers={typingUsers} />
              </div>
            )}

            {attachments.length > 0 && (
              <AttachmentPreviewList
                attachments={attachments}
                onRemove={handleRemoveAttachment}
              />
            )}

            {(isRecording || audioUrl) && (
              <div className="border-b p-3">
                <AudioRecorder
                  audioUrl={audioUrl}
                  duration={duration}
                  isRecording={isRecording}
                  onCancel={handleAudioCancel}
                  onSend={handleAudioSend}
                  onStart={startRecording}
                  onStop={stopRecording}
                />
              </div>
            )}

            <MessageEditor
              content={text}
              disabled={isRecording || audioUrl !== null}
              fetchUsers={fetchUsers}
              isMaximized={onMaximize ? false : isEditorMaximized}
              onChange={handleMarkdownChange}
              onMaximize={handleMaximize}
              onSubmit={handleSubmit}
            />

            <div className="border-t p-3">
              <ComposerActions
                hasAttachments={attachments.length > 0}
                hasAudio={audioUrl !== null}
                hasText={text.trim().length > 0}
                isCreatingMessage={false}
                isRecording={isRecording}
                onEmojiSelect={handleEmojiSelect}
                onFileUpload={() => fileInputRef.current?.click()}
                onSubmit={handleSubmit}
                onVoiceRecord={handleVoiceRecord}
                recordingDuration={duration}
                text={text}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
