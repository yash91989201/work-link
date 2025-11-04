import type { MessageWithSenderType } from "@work-link/api/lib/types";
import type { UserType } from "@work-link/db/lib/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { queryUtils } from "@/utils/orpc";
import { EnhancedMessageContent } from "@/components/shared/message-content";

interface MessageContentProps {
  message: MessageWithSenderType & {
    mentionedUsers?: UserType[] | null;
  };
}

export function MessageContent({ message }: MessageContentProps) {
  const { data: mentionUsers } = useSuspenseQuery(
    queryUtils.communication.message.getMentionUsers.queryOptions({
      input: {
        userIds: message.mentions || [],
      },
    })
  );

  return (
    <div className="mt-1 space-y-2">
      <EnhancedMessageContent 
        message={{
          ...message,
          mentionedUsers: mentionUsers,
        }} 
      />
    </div>
  );
}
