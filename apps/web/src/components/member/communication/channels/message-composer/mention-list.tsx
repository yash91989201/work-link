import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface MentionListProps {
  items: Array<{
    id: string;
    name: string;
    email: string;
    image?: string | null;
  }>;
  command: (item: { id: string; label: string }) => void;
}

export interface MentionListRef {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

// biome-ignore lint/nursery/noReactForwardRef: <required here>
export const MentionList = forwardRef<MentionListRef, MentionListProps>(
  (props, ref) => {
    const { items, command } = props;
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index];
        if (item) {
          command({
            id: item.id,
            label: item.name || item.email,
          });
        }
      },
      [items, command]
    );

    const upHandler = useCallback(
      () => setSelectedIndex((i) => (i + items.length - 1) % items.length),
      [items.length]
    );

    const downHandler = useCallback(
      () => setSelectedIndex((i) => (i + 1) % items.length),
      [items.length]
    );

    useEffect(() => {
      if (items.length === 0) return;
      setSelectedIndex(0);
    }, [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === "ArrowUp") {
          upHandler();
          return true;
        }
        if (event.key === "ArrowDown") {
          downHandler();
          return true;
        }
        if (event.key === "Enter" || event.key === "Tab") {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="rounded-lg border bg-popover p-2 shadow-md">
          <div className="px-2 py-1.5 text-muted-foreground text-sm">
            No users found
          </div>
        </div>
      );
    }

    return (
      <div className="min-w-[280px] rounded-lg border bg-popover p-1 shadow-md">
        {items.map((item, index) => (
          <button
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
              index === selectedIndex
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent/50"
            )}
            key={item.id}
            onClick={() => selectItem(index)}
            type="button"
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage alt={item.name} src={item.image || undefined} />
              <AvatarFallback className="text-xs">
                {item.name?.[0]?.toUpperCase() || item.email[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium">
                {item.name || item.email}
              </span>
              {item.name && (
                <span className="truncate text-muted-foreground text-xs">
                  {item.email}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    );
  }
);

MentionList.displayName = "MentionList";
