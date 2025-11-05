import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { LinkPreviewComponent } from "./link-preview-component";

export interface LinkPreviewOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    linkPreview: {
      setLinkPreview: (options: { url: string }) => ReturnType;
      removeLinkPreview: () => ReturnType;
    };
  }
}

export const LinkPreviewNode = Node.create<LinkPreviewOptions>({
  name: "linkPreview",
  group: "block",
  atom: true,
  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      url: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-url"),
        renderHTML: (attributes) => {
          if (!attributes.url) {
            return {};
          }
          return {
            "data-url": attributes.url,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="link-preview"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "link-preview",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LinkPreviewComponent);
  },

  addCommands() {
    return {
      setLinkPreview:
        (options) =>
        ({ commands }) => {
          console.log('[LinkPreviewNode] setLinkPreview called with:', options);
          const result = commands.insertContent({
            type: this.name,
            attrs: options,
          });
          console.log('[LinkPreviewNode] insertContent result:', result);
          return result;
        },
      removeLinkPreview:
        () =>
        ({ commands, state }) => {
          const { from } = state.selection;
          const nodeAtPos = state.doc.nodeAt(from);

          if (nodeAtPos?.type.name === this.name) {
            return commands.deleteRange({
              from,
              to: from + nodeAtPos.nodeSize,
            });
          }

          return false;
        },
    };
  },
});
