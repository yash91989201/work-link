import { Kbd } from "@/components/ui/kbd";

export function HelpText() {
  return (
    <div className="mt-3 flex items-center justify-between text-muted-foreground text-xs">
      <div className="flex items-center gap-3">
        <p className="flex items-center gap-1">
          <Kbd>Enter</Kbd>
          to send
        </p>
        <span>•</span>
        <p className="flex items-center gap-1">
          <Kbd>Shift+Enter</Kbd>
          new line
        </p>
        <span>•</span>
        <p className="flex items-center gap-1">
          <Kbd>@</Kbd>
          to mention
        </p>
      </div>
    </div>
  );
}
