import { and, eq, useLiveSuspenseQuery } from "@tanstack/react-db";
import {
  attachmentsCollection,
  messagesCollection,
  usersCollection,
} from "@/db/collections";
import { buildMessageWithAttachments } from "@/lib/communications/message";

export function usePinnedMessages({ channelId }: { channelId: string }) {
  const { data: rows } = useLiveSuspenseQuery(
    (q) =>
      q
        .from({ message: messagesCollection })
        .innerJoin({ sender: usersCollection }, ({ message, sender }) =>
          eq(message.senderId, sender.id)
        )
        .leftJoin(
          { attachment: attachmentsCollection },
          ({ message, attachment }) => eq(attachment.messageId, message.id)
        )
        .where(({ message }) =>
          and(eq(message.channelId, channelId), eq(message.isPinned, true))
        )
        .orderBy(({ message }) => message.pinnedAt, "desc")
        .select(({ message, sender, attachment }) => ({
          message,
          sender,
          attachment,
        })),
    [channelId]
  );

  const messagesMap = new Map<
    string,
    ReturnType<typeof buildMessageWithAttachments>
  >();

  for (const { message, sender, attachment } of rows) {
    let entry = messagesMap.get(message.id);
    if (!entry) {
      entry = buildMessageWithAttachments(message, sender);
      messagesMap.set(message.id, entry);
    }
    if (attachment) {
      entry.attachments.push(attachment);
    }
  }

  const messages = Array.from(messagesMap.values());

  return { pinnedMessages: messages };
}
