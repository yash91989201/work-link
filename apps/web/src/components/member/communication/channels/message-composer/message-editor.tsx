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
  LinkIcon,
  List,
  ListOrdered,
  Maximize,
  Minimize2,
  Strikethrough,
  Trash2,
  UnderlineIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { AutoLinkPreview } from "./auto-link-preview";
import { LinkBubbleMenu } from "./link-bubble-menu";
import { LinkPreviewNode } from "./link-preview-node";
import { createMentionSuggestion } from "./mention-suggestion";
import "tippy.js/dist/tippy.css";
import "@/styles/tiptap.css";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

const URL_REGEX = /^[a-zA-Z]+:\/\//;

interface MessageEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  onCursorChange?: (position: number) => void;
  fetchUsers: (
    query: string
  ) => Promise<Array<{ id: string; name: string; email: string }>>;
  onMaximize?: () => void;
  onMinimize?: () => void;
  isMaximized?: boolean;
  isInMaximizedComposer?: boolean;
}

export function MessageEditor({
  content,
  onChange,
  onSubmit,
  placeholder = "Type a message...",
  disabled = false,
  onCursorChange,
  fetchUsers,
  onMaximize,
  onMinimize,
  isMaximized = false,
  isInMaximizedComposer = false,
}: MessageEditorProps) {
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
        HTMLAttributes: {
          class: "tiptap-link",
          rel: "noopener noreferrer",
          target: "_blank",
        },
        shouldAutoLink: (url) => {
          const checkUrl = z.url().safeParse(url);
          return checkUrl.success;
        },
      }),
      Image.configure({
        resize: {
          enabled: true,
          alwaysPreserveAspectRatio: true,
        },
      }),
      LinkPreviewNode,
      AutoLinkPreview,
      Dropcursor,
    ],
    content,
    editable: !disabled,
    autofocus: true,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      const { from } = editor.state.selection;
      onCursorChange?.(from);
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none p-2 focus:outline-none sm:p-3",
          isMaximized && isInMaximizedComposer
            ? "min-h-[50vh] overflow-y-auto sm:min-h-[60vh]"
            : "max-h-32 min-h-24 overflow-y-auto"
        ),
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

  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const handleAddLink = useCallback(() => {
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, " ");

    if (text) {
      // User has selected text
      setIsLinkDialogOpen(true);
    } else {
      // No text selected, just show dialog
      setIsLinkDialogOpen(true);
    }
  }, [editor]);

  const handleSaveLink = useCallback(() => {
    if (linkUrl) {
      // Ensure URL has protocol
      let url = linkUrl;
      if (!url.match(URL_REGEX)) {
        url = `https://${url}`;
      }

      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, " ");

      if (text) {
        // Text is selected, apply link to selection (keep the text)
        editor.chain().focus().setLink({ href: url }).run();
      } else {
        // No text selected, insert the URL as both text and link
        editor
          .chain()
          .focus()
          .insertContent({
            type: "text",
            marks: [{ type: "link", attrs: { href: url } }],
            text: url,
          })
          .run();
      }

      // Note: Preview will be auto-inserted by AutoLinkPreview extension

      setLinkUrl("");
      setIsLinkDialogOpen(false);
    }
  }, [editor, linkUrl]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col",
        isMaximized ? "flex-1 overflow-hidden" : "space-y-2"
      )}
    >
      <input
        accept="image/*"
        className="hidden"
        multiple
        onChange={handleFileInputChange}
        ref={fileInputRef}
        type="file"
      />
      <div className="flex shrink-0 flex-wrap items-center gap-1 border-b p-2 sm:p-3">
        <Toggle
          aria-label="Toggle bold"
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          pressed={editor.isActive("bold")}
          size="sm"
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-3 w-3 sm:h-4 sm:w-4" />
        </Toggle>

        <Toggle
          aria-label="Toggle italic"
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          pressed={editor.isActive("italic")}
          size="sm"
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-3 w-3 sm:h-4 sm:w-4" />
        </Toggle>

        <Toggle
          aria-label="Toggle strikethrough"
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          pressed={editor.isActive("strike")}
          size="sm"
          title="Strikethrough (Ctrl+Shift+S)"
        >
          <Strikethrough className="h-3 w-3 sm:h-4 sm:w-4" />
        </Toggle>

        <Toggle
          aria-label="Toggle underline"
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          pressed={editor.isActive("underline")}
          size="sm"
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="h-3 w-3 sm:h-4 sm:w-4" />
        </Toggle>

        <Toggle
          aria-label="Toggle code"
          onPressedChange={() => editor.chain().focus().toggleCode().run()}
          pressed={editor.isActive("code")}
          size="sm"
          title="Inline Code (Ctrl+E)"
        >
          <Code className="h-3 w-3 sm:h-4 sm:w-4" />
        </Toggle>

        <Separator className="mx-1 h-6" orientation="vertical" />

        <Toggle
          aria-label="Toggle bullet list"
          onPressedChange={() =>
            editor.chain().focus().toggleBulletList().run()
          }
          pressed={editor.isActive("bulletList")}
          size="sm"
          title="Bullet List (Ctrl+Shift+8)"
        >
          <List className="h-3 w-3 sm:h-4 sm:w-4" />
        </Toggle>

        <Toggle
          aria-label="Toggle ordered list"
          onPressedChange={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
          pressed={editor.isActive("orderedList")}
          size="sm"
          title="Ordered List (Ctrl+Shift+7)"
        >
          <ListOrdered className="h-3 w-3 sm:h-4 sm:w-4" />
        </Toggle>

        <Separator className="mx-1 h-6" orientation="vertical" />
        <Toggle
          aria-label="Add a link"
          onPressedChange={handleAddLink}
          pressed={editor.isActive("link")}
          size="sm"
          title="Insert Link (Ctrl+K)"
        >
          <LinkIcon className="h-3 w-3 sm:h-4 sm:w-4" />
        </Toggle>

        <Toggle
          aria-label="Upload image"
          onPressedChange={handleImageUploadClick}
          pressed={false}
          size="sm"
          title="Upload Image"
        >
          <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4" />
        </Toggle>

        <div className="ml-auto flex items-center gap-1">
          <Toggle
            aria-label={isMaximized ? "Minimize editor" : "Maximize editor"}
            onPressedChange={() => {
              if (isMaximized) {
                onMinimize?.();
              } else {
                onMaximize?.();
              }
            }}
            pressed={isMaximized}
            size="sm"
            title={
              isMaximized
                ? "Minimize Editor (Ctrl+M)"
                : "Maximize Editor (Ctrl+M)"
            }
          >
            {isMaximized ? (
              <Minimize2 className="h-3 w-3 sm:h-4 sm:w-4" />
            ) : (
              <Maximize className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
          </Toggle>
          <Button
            aria-label="Clear content"
            onClick={() => {
              editor.chain().focus().clearContent().run();
            }}
            size="icon"
            title="Clear Content"
            variant="destructive"
          >
            <Trash2 className="text-destructive-foreground" />
          </Button>
        </div>
      </div>

      <div className={cn("relative", isMaximized && "flex-1 overflow-y-auto")}>
        <LinkBubbleMenu editor={editor} />
        <EditorContent
          className={cn("p-2 sm:p-3", disabled && "opacity-50")}
          editor={editor}
        />
      </div>

      <Dialog onOpenChange={setIsLinkDialogOpen} open={isLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                autoFocus
                id="link-url"
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSaveLink();
                  }
                }}
                placeholder="https://example.com"
                type="url"
                value={linkUrl}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setLinkUrl("");
                setIsLinkDialogOpen(false);
              }}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveLink} type="button">
              Insert Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
