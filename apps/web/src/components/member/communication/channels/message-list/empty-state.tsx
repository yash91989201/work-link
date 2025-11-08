import { MessageCircle, Sparkles } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export const EmptyState = () => (
  <div className="flex h-full items-center justify-center p-8">
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <div className="relative">
            <MessageCircle className="h-12 w-12 text-primary" />
            <Sparkles className="-top-1 -right-1 absolute h-5 w-5 text-primary/70" />
          </div>
        </EmptyMedia>
        <EmptyTitle className="text-2xl">Welcome to the channel!</EmptyTitle>
        <EmptyDescription className="max-w-md text-base">
          Start by sending a message to break the ice and connect with your
          team. 🎉
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="w-full max-w-md space-y-3 rounded-lg border bg-muted/30 p-4">
          <p className="font-semibold text-foreground text-sm">Quick Tips:</p>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li className="flex items-start gap-2 text-left">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>Be respectful and professional in all conversations</span>
            </li>
            <li className="flex items-start gap-2 text-left">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                Use{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">@</code>{" "}
                to mention team members
              </span>
            </li>
            <li className="flex items-start gap-2 text-left">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>Share files using the attachment button</span>
            </li>
            <li className="flex items-start gap-2 text-left">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>Use threads to keep related discussions organized</span>
            </li>
          </ul>
        </div>
      </EmptyContent>
    </Empty>
  </div>
);
