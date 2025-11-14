import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export const AutoLinkPreview = Extension.create({
  name: "autoLinkPreview",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("autoLinkPreview"),
        appendTransaction: (transactions, oldState, newState) => {
          // Check if there was a text input
          const docChanged = transactions.some((tr) => tr.docChanged);
          if (!docChanged) return null;

          // Find newly created links
          const { doc } = newState;
          const { doc: oldDoc } = oldState;

          let tr = newState.tr;
          let modified = false;

          doc.descendants((node, pos) => {
            // Check if this is a paragraph with a link mark
            if (
              node.type.name === "text" &&
              node.marks.some((mark) => mark.type.name === "link")
            ) {
              const linkMark = node.marks.find(
                (mark) => mark.type.name === "link"
              );
              if (!linkMark) return;

              const url = linkMark.attrs.href;

              // Check if this link was just created
              const oldNode = oldDoc.nodeAt(pos);
              const wasLink = oldNode?.marks.some(
                (mark) => mark.type.name === "link" && mark.attrs.href === url
              );

              // If this is a new link, check if we should add a preview
              if (!wasLink && url) {
                // Check if there's already a preview for this URL right after
                const nextPos = pos + node.nodeSize;
                const nextNode = doc.nodeAt(nextPos);

                const hasPreview =
                  nextNode?.type.name === "linkPreview" &&
                  nextNode?.attrs.url === url;

                if (!hasPreview) {
                  // Find the end of the paragraph
                  const parent = doc.resolve(pos).parent;
                  let paragraphEnd = pos + node.nodeSize;

                  if (parent.type.name === "paragraph") {
                    paragraphEnd = pos + parent.nodeSize - 1;
                  }

                  // Insert a new paragraph and then the preview
                  const linkPreviewType = newState.schema.nodes.linkPreview;
                  if (linkPreviewType) {
                    const paragraph = newState.schema.nodes.paragraph?.create();
                    const preview = linkPreviewType.create({ url });

                    tr = tr.insert(paragraphEnd, [paragraph, preview]);
                    modified = true;
                  }
                }
              }
            }
          });

          return modified ? tr : null;
        },
      }),
    ];
  },
});
