import { ReactRenderer } from "@tiptap/react";
import type { SuggestionOptions, SuggestionProps } from "@tiptap/suggestion";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import type { MentionListRef } from "./mention-list";
import { MentionList } from "./mention-list";

export const createMentionSuggestion = (
  fetchUsers: (
    query: string
  ) => Promise<Array<{ id: string; name: string; email: string }>>
): Omit<SuggestionOptions, "editor"> => ({
  char: "@",

  items: async ({ query }) => {
    const users = await fetchUsers(query);
    return users.slice(0, 10);
  },

  render: () => {
    let component:
      | (ReactRenderer<typeof MentionList> & { ref: MentionListRef | null })
      | null = null;

    let popup: TippyInstance[] | null = null;

    return {
      onStart(props: SuggestionProps) {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        }) as typeof component;

        if (!props.clientRect || component === null) return;

        popup = tippy("body", {
          getReferenceClientRect: props.clientRect as () => DOMRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
      },

      onUpdate(props: SuggestionProps) {
        if (!component) return;
        component.updateProps(props);

        if (props.clientRect) {
          popup?.[0]?.setProps({
            getReferenceClientRect: props.clientRect as () => DOMRect,
          });
        }
      },

      onKeyDown(props) {
        if (!component) return false;

        if (props.event.key === "Escape") {
          popup?.[0]?.hide();
          return true;
        }

        return component.ref?.onKeyDown(props.event) ?? false;
      },

      onExit() {
        popup?.[0]?.destroy();
        component?.destroy();
        popup = null;
        component = null;
      },
    };
  },
});
