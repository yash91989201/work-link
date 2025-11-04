import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Mention from "@tiptap/extension-mention";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { Dropcursor } from "@tiptap/extensions";
import type { Editor } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code,
  Image as ImageIcon,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
  UnderlineIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { createMentionSuggestion } from "./mention-suggestion";
import "tippy.js/dist/tippy.css";
import "@/styles/tiptap.css";
import { supabase } from "@/lib/supabase";

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
  const uploadImageToSupabase = useCallback(
    async (file: File): Promise<string> => {
      const bucket = "message-image";

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(file.name, file);

      if (error || !data) throw new Error("Upload failed");

      // Get public URL
      const { data: publicData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return publicData.publicUrl;
    },
    []
  );

  const editorRef = useRef<Editor | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImageUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  const handleFileInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        try {
          const url = await uploadImageToSupabase(file);
          if (url) {
            editorRef.current
              ?.chain()
              .focus()
              .setImage({ src: url, height: 240, width: 240 })
              .run();
          }
        } catch (error) {
          console.error("Image upload failed", error);
        }
      }
      e.currentTarget.value = "";
    },
    [uploadImageToSupabase]
  );

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
      Link.configure({
        autolink: true,
        linkOnPaste: true,
        openOnClick: false,
        protocols: ["http", "https", "mailto", "tel"],
      }),
      Image.configure({
        resize: {
          enabled: true,
          alwaysPreserveAspectRatio: true,
        },
      }),
      Dropcursor,
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
      handlePaste: (_view, event) => {
        const items = Array.from(event.clipboardData?.items ?? []);
        const imageItem = items.find((i) => i.type.startsWith("image/"));
        if (imageItem) {
          event.preventDefault();
          const file = imageItem.getAsFile();
          if (file) {
            uploadImageToSupabase(file)
              .then((url) => {
                if (url) {
                  editorRef.current
                    ?.chain()
                    .focus()
                    .setImage({ src: url })
                    .run();
                }
              })
              .catch((e) => {
                console.error("Image upload failed", e);
              });
          }
          return true;
        }
        return false;
      },
      handleDrop: (_view, event) => {
        const files = Array.from(event.dataTransfer?.files ?? []);
        const imageFiles = files.filter((f) => f.type.startsWith("image/"));
        if (imageFiles.length > 0) {
          event.preventDefault();
          for (const file of imageFiles) {
            uploadImageToSupabase(file)
              .then((url) => {
                if (url) {
                  editorRef.current
                    ?.chain()
                    .focus()
                    .setImage({ src: url })
                    .run();
                }
              })
              .catch(() => {
                console.error("Image upload failed");
              });
          }
          return true;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

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
      <input
        accept="image/*"
        className="hidden"
        multiple
        onChange={handleFileInputChange}
        ref={fileInputRef}
        type="file"
      />
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

        <Separator className="h-6" orientation="vertical" />

        <Toggle
          aria-label="Upload image"
          onPressedChange={handleImageUploadClick}
          pressed={false}
          size="sm"
        >
          <ImageIcon className="h-4 w-4" />
        </Toggle>
      </div>

      <EditorContent className={cn(disabled && "opacity-50")} editor={editor} />
    </div>
  );
}
