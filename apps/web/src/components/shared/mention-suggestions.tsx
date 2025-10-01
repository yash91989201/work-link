import { Check } from "lucide-react";
import { Command } from "cmdk";
import { forwardRef, useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Mention {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface MentionSuggestionsProps {
  query: string;
  onSelect: (mention: Mention) => void;
  users: Mention[];
  isVisible: boolean;
}

export const MentionSuggestions = forwardRef<HTMLDivElement, MentionSuggestionsProps>(
  ({ query, onSelect, users, isVisible }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
      if (isVisible && containerRef.current) {
        containerRef.current.focus();
      }
    }, [isVisible]);

    useEffect(() => {
      setSelectedIndex(0); // Reset selection when users change
    }, [users]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isVisible) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % users.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + users.length) % users.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (users.length > 0) {
            onSelect(users[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          // Let the parent handle this
          break;
      }
    };

    const handleSelect = (mention: Mention, index: number) => {
      setSelectedIndex(index);
      onSelect(mention);
    };

    return (
      <div
        ref={containerRef}
        className={cn(
          "absolute bottom-full left-0 z-50 mb-2 max-h-60 w-64 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
        )}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <Command shouldFilter={false}>
          <Command.List>
            {users.length === 0 ? (
              <Command.Empty className="py-6 text-center text-sm">
                No users found.
              </Command.Empty>
            ) : (
              users.map((user, index) => (
                <Command.Item
                  key={user.id}
                  className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                    "hover:bg-accent hover:text-accent-foreground",
                    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
                    selectedIndex === index && "bg-accent text-accent-foreground"
                  )}
                  onSelect={() => handleSelect(user, index)}
                >
                  <Avatar className="mr-2 h-6 w-6">
                    <AvatarImage
                      alt={user.name || "User"}
                      src={user.image || undefined}
                    />
                    <AvatarFallback className="text-xs">
                      {(user.name || "U").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">
                      {user.name || user.email}
                    </div>
                    {user.name && (
                      <div className="truncate text-muted-foreground text-xs">
                        {user.email}
                      </div>
                    )}
                  </div>
                  <Check className={cn(
                    "ml-2 h-4 w-4 transition-opacity",
                    selectedIndex === index ? "opacity-100" : "opacity-0"
                  )} />
                </Command.Item>
              ))
            )}
          </Command.List>
        </Command>
      </div>
    );
  }
);

MentionSuggestions.displayName = "MentionSuggestions";