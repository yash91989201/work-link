import type { Editor } from "@tiptap/core";
import { ArrowRight, ExternalLink, Pencil, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface LinkBubbleMenuProps {
  editor: Editor;
}

export function LinkBubbleMenu({ editor }: LinkBubbleMenuProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isEditPopoverOpen, setIsEditPopoverOpen] = useState(false);
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
      // Don't update position when popover is open
      if (!isEditPopoverOpen) {
        updatePosition();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      // Don't close menu if clicking in popover
      if (isEditPopoverOpen) return;
      
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
  }, [editor, updatePosition, isEditPopoverOpen]);

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
    setIsEditPopoverOpen(false);
    setEditUrl("");
  }, [editor, editUrl]);

  const handleRemoveLink = useCallback(() => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setIsVisible(false);
    setIsEditPopoverOpen(false);
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
    setIsEditPopoverOpen(false);
  }, []);

  if (!isVisible) return null;

  return (
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
          title="Open link"
          type="button"
          variant="ghost"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
        <Popover onOpenChange={setIsEditPopoverOpen} open={isEditPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              className="h-9 rounded-none border-r"
              onClick={() => {
                setEditUrl(currentUrl || "");
                setIsEditPopoverOpen(true);
              }}
              size="sm"
              title="Edit link"
              type="button"
              variant="ghost"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 p-2">
            <InputGroup>
              <InputGroupInput
                autoFocus
                onChange={(e) => setEditUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSaveEdit();
                  }
                  if (e.key === "Escape") {
                    handleCancelEdit();
                  }
                }}
                placeholder="https://example.com"
                type="url"
                value={editUrl}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  onClick={handleCancelEdit}
                  size="icon-xs"
                  title="Cancel"
                  type="button"
                  variant="ghost"
                >
                  <X className="h-3.5 w-3.5" />
                </InputGroupButton>
                <InputGroupButton
                  onClick={handleSaveEdit}
                  size="icon-xs"
                  title="Save"
                  type="button"
                  variant="ghost"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </PopoverContent>
        </Popover>
        <Button
          className="h-9 rounded-none"
          onClick={handleRemoveLink}
          size="sm"
          title="Remove link"
          type="button"
          variant="ghost"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
