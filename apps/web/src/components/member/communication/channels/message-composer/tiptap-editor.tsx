import Mention from "@tiptap/extension-mention";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
  UnderlineIcon,
} from "lucide-react";
import { useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { createMentionSuggestion } from "./mention-suggestion";
import "tippy.js/dist/tippy.css";

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  onCursorChange?: (position: number) => void;
  fetchUsers: (
    query: string
  ) => Promise<Array<{ id: string; name: string; email: string }>>;
}

export function TiptapEditor({
  content,
  onChange,
  onSubmit,
  placeholder = "Type a message...",
  disabled = false,
  onCursorChange,
  fetchUsers,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Underline,
      Placeholder.configure({
        placeholder,
      }),
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
        },
        suggestion: createMentionSuggestion(fetchUsers),
      }),
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      const { from } = editor.state.selection;
      onCursorChange?.(from);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-24 max-h-48 overflow-y-auto p-3",
      },
      handleKeyDown: (_, event) => {
        if (event.key === "Enter" && event.shiftKey) {
          event.preventDefault();
          onSubmit();
          return true;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const currentContent = editor.getHTML();
    if (content !== currentContent && content !== editor.getText()) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 border-b px-2 py-1">
        <Toggle
          aria-label="Toggle bold"
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          pressed={editor.isActive("bold")}
          size="sm"
        >
          <Bold className="h-4 w-4" />
        </Toggle>

        <Toggle
          aria-label="Toggle italic"
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          pressed={editor.isActive("italic")}
          size="sm"
        >
          <Italic className="h-4 w-4" />
        </Toggle>

        <Toggle
          aria-label="Toggle strikethrough"
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          pressed={editor.isActive("strike")}
          size="sm"
        >
          <Strikethrough className="h-4 w-4" />
        </Toggle>

        <Toggle
          aria-label="Toggle underline"
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          pressed={editor.isActive("underline")}
          size="sm"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Toggle>

        <Toggle
          aria-label="Toggle code"
          onPressedChange={() => editor.chain().focus().toggleCode().run()}
          pressed={editor.isActive("code")}
          size="sm"
        >
          <Code className="h-4 w-4" />
        </Toggle>

        <Separator className="h-6" orientation="vertical" />

        <Toggle
          aria-label="Toggle bullet list"
          onPressedChange={() =>
            editor.chain().focus().toggleBulletList().run()
          }
          pressed={editor.isActive("bulletList")}
          size="sm"
        >
          <List className="h-4 w-4" />
        </Toggle>

        <Toggle
          aria-label="Toggle ordered list"
          onPressedChange={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
          pressed={editor.isActive("orderedList")}
          size="sm"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
      </div>

      <EditorContent className={cn(disabled && "opacity-50")} editor={editor} />
    </div>
  );
}
