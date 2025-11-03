import { MessageCircle } from "lucide-react";
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
          <MessageCircle className="h-10 w-10" />
        </EmptyMedia>
        <EmptyTitle>Welcome to the channel!</EmptyTitle>
        <EmptyDescription>
          This is the beginning of your conversation. Start by sending a message
          to break the ice. 🎉
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="space-y-2">
          <p className="font-medium text-muted-foreground text-xs">Tips:</p>
          <ul className="space-y-1 text-muted-foreground text-xs">
            <li>• Be respectful and professional</li>
            <li>• Use @ to mention team members</li>
            <li>• Share files with the attachment button</li>
          </ul>
        </div>
      </EmptyContent>
    </Empty>
  </div>
);
