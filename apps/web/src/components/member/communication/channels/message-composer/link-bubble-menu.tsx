import type { Editor } from "@tiptap/core";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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

interface LinkBubbleMenuProps {
  editor: Editor;
}

export function LinkBubbleMenu({ editor }: LinkBubbleMenuProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editUrl, setEditUrl] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const { view, state } = editor;
    const { from } = state.selection;

    if (!editor.isActive("link")) {
      setIsVisible(false);
      return;
    }

    const node = view.domAtPos(from).node;
    const linkElement =
      node.nodeType === Node.TEXT_NODE
        ? node.parentElement?.closest("a")
        : (node as HTMLElement).closest("a");

    if (linkElement) {
      const rect = linkElement.getBoundingClientRect();
      const editorRect = view.dom.getBoundingClientRect();

      setPosition({
        top: rect.bottom - editorRect.top + 8,
        left: rect.left - editorRect.left, // Align with start of link
      });

      // Get and store the current URL
      const href = editor.getAttributes("link").href as string;
      setCurrentUrl(href || "");
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [editor]);

  useEffect(() => {
    const handleUpdate = () => {
      // Don't update position when dialog is open
      if (!isEditDialogOpen) {
        updatePosition();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      // Don't close menu if clicking in dialog
      if (isEditDialogOpen) return;
      
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        const { view } = editor;
        if (!view.dom.contains(e.target as Node)) {
          setIsVisible(false);
        }
      }
    };

    editor.on("selectionUpdate", handleUpdate);
    editor.on("update", handleUpdate);
    editor.on("focus", handleUpdate);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      editor.off("selectionUpdate", handleUpdate);
      editor.off("update", handleUpdate);
      editor.off("focus", handleUpdate);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editor, updatePosition, isEditDialogOpen]);

  const handleEditLink = useCallback(() => {
    setEditUrl(currentUrl || "");
    setIsEditDialogOpen(true);
  }, [currentUrl]);

  const handleSaveEdit = useCallback(() => {
    if (editUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: editUrl })
        .run();
      setCurrentUrl(editUrl);
    }
    setIsEditDialogOpen(false);
    setEditUrl("");
  }, [editor, editUrl]);

  const handleRemoveLink = useCallback(() => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setIsVisible(false);
    setIsEditDialogOpen(false);
  }, [editor]);

  const handleOpenLink = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (currentUrl) {
        window.open(currentUrl, "_blank", "noopener,noreferrer");
      }
    },
    [currentUrl]
  );

  const handleCancelEdit = useCallback(() => {
    setEditUrl("");
    setIsEditDialogOpen(false);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <div
        className="absolute z-50"
        ref={menuRef}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <div className="flex items-center overflow-hidden rounded-lg border bg-background shadow-lg">
          <Button
            className="h-9 rounded-none border-r"
            onClick={handleOpenLink}
            size="sm"
            type="button"
            variant="ghost"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            className="h-9 rounded-none border-r"
            onClick={handleEditLink}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            className="h-9 rounded-none"
            onClick={handleRemoveLink}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog onOpenChange={setIsEditDialogOpen} open={isEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-url">URL</Label>
              <Input
                autoFocus
                id="edit-url"
                onChange={(e) => setEditUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSaveEdit();
                  }
                }}
                placeholder="https://example.com"
                type="url"
                value={editUrl}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleCancelEdit}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} type="button">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
