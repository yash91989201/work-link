import { TiptapEditor } from "./tiptap-editor";
import { TypingIndicator } from "./typing-indicator";
import { ComposerActions } from "./composer-actions";

interface MarkdownEditorProps {
  text: string;
  isCreatingMessage: boolean;
  isRecording: boolean;
  typingUsers: { userId: string; userName: string }[];
  onTextChange: (content: string) => void;
  onEmojiSelect: (emoji: { emoji: string; label: string }) => void;
  onFileUpload: () => void;
  onVoiceRecord: () => void;
  onSubmit: () => void;
  fetchUsers: (query: string) => Promise<Array<{ id: string; name: string; email: string }>>;
}

export function MarkdownEditor({
  text,
  isCreatingMessage,
  isRecording,
  typingUsers,
  onTextChange,
  onEmojiSelect,
  onFileUpload,
  onVoiceRecord,
  onSubmit,
  fetchUsers,
}: MarkdownEditorProps) {
  return (
    <div className="rounded-lg border bg-background shadow-sm backdrop-blur-sm transition-all duration-200">
      {typingUsers.length > 0 && (
        <div className="border-b px-4 py-2">
          <TypingIndicator typingUsers={typingUsers} />
        </div>
      )}

      <TiptapEditor
        content={text}
        disabled={isCreatingMessage}
        fetchUsers={fetchUsers}
        onChange={onTextChange}
        onSubmit={onSubmit}
        placeholder="Type a message..."
      />

      <div className="border-t px-4 py-2">
        <ComposerActions
          isCreatingMessage={isCreatingMessage}
          isRecording={isRecording}
          onEmojiSelect={onEmojiSelect}
          onFileUpload={onFileUpload}
          onSubmit={onSubmit}
          onVoiceRecord={onVoiceRecord}
          text={text}
        />
      </div>
    </div>
  );
}
