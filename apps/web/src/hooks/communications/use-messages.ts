import { and, eq, isNull, useLiveSuspenseQuery } from "@tanstack/react-db";
import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  attachmentsCollection,
  messagesCollection,
  usersCollection,
} from "@/db/collections";
import { buildMessageWithAttachments } from "@/lib/communications/message";

export function useMessages() {
  const { id: channelId } = useParams({
    from: "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id",
  });

  const { data: rowsWithExtra } = useLiveSuspenseQuery(
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
          and(
            eq(message.channelId, channelId),
            isNull(message.isDeleted),
            isNull(message.parentMessageId)
          )
        )
        .orderBy(({ message }) => message.createdAt)
        .select(({ message, sender, attachment }) => ({
          message,
          sender,
          attachment,
        })),
    [channelId]
  );

  const messagesMap = useMemo(() => {
    const map = new Map<
      string,
      ReturnType<typeof buildMessageWithAttachments>
    >();

    for (const { message, sender, attachment } of rowsWithExtra) {
      let entry = map.get(message.id);

      if (!entry) {
        entry = buildMessageWithAttachments(message, sender);
        map.set(message.id, entry);
      }

      if (attachment) {
        entry.attachments.push(attachment);
      }
    }

    return map;
  }, [rowsWithExtra]);

  const messages = useMemo(
    () => Array.from(messagesMap.values()),
    [messagesMap]
  );

  return {
    messages,
  };
}
