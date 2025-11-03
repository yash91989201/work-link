import { Command } from "cmdk";
import { Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Mention {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

type MentionSuggestionsProps = {
  query: string;
  onSelect: (mention: Mention) => void;
  users: Mention[];
  isVisible: boolean;
  isLoading?: boolean;
  selectedIndex?: number;
  ref?: React.Ref<HTMLDivElement>;
};

export const MentionSuggestions = ({
  query,
  onSelect,
  users,
  isVisible,
  isLoading = false,
  selectedIndex = 0,
  ref,
}: MentionSuggestionsProps) => {
  const handleSelect = (mention: Mention) => {
    onSelect(mention);
  };

  if (!isVisible) {
    return null;
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="py-6 text-center text-muted-foreground text-sm">
          Searching...
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <Command.Empty className="py-6 text-center text-sm">
          {query.trim() ? "No users found." : "Type to search users..."}
        </Command.Empty>
      );
    }

    return users.map((user, index) => (
      <Command.Item
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
          "hover:bg-accent hover:text-accent-foreground",
          "data-disabled:pointer-events-none data-disabled:opacity-50",
          "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          selectedIndex === index && "bg-accent text-accent-foreground"
        )}
        key={user.id}
        onSelect={() => handleSelect(user)}
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
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">{user.name || user.email}</div>
          {user.name && (
            <div className="truncate text-muted-foreground text-xs">
              {user.email}
            </div>
          )}
        </div>
        <Check
          className={cn(
            "ml-2 h-4 w-4 transition-opacity",
            selectedIndex === index ? "opacity-100" : "opacity-0"
          )}
        />
      </Command.Item>
    ));
  };

  return (
    <div
      className={cn(
        "absolute bottom-full left-0 z-50 mb-2 max-h-60 w-64 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        "data-[state=closed]:animate-out data-[state=open]:animate-in",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
      )}
      ref={ref}
    >
      <Command shouldFilter={false}>
        <Command.List>{renderContent()}</Command.List>
      </Command>
    </div>
  );
};
