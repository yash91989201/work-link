// hooks/communications/use-messages.ts
import { and, eq, isNull, useLiveInfiniteQuery } from "@tanstack/react-db";
import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  attachmentsCollection,
  messagesCollection,
  usersCollection,
} from "@/db/collections";
import { buildMessageWithAttachments } from "@/lib/communications/message";

const PAGE_SIZE = 100;

export function useMessages() {
  const { id: channelId } = useParams({
    from: "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id",
  });

  const { pages, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useLiveInfiniteQuery(
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
              isNull(message.deletedAt),
              isNull(message.parentMessageId)
            )
          )
          .orderBy(({ message }) => message.createdAt, "desc")
          .select(({ message, sender, attachment }) => ({
            message,
            sender,
            attachment,
          })),
      {
        pageSize: PAGE_SIZE,
        getNextPageParam: (lastPage, allPages) =>
          lastPage.length === PAGE_SIZE ? allPages.length : undefined,
      },
      [channelId]
    );

  const rowsWithExtra = useMemo(() => (pages ? pages.flat() : []), [pages]);

  const messages = useMemo(() => {
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

    const ordered = Array.from(map.values()).sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return ordered;
  }, [rowsWithExtra]);

  return {
    messages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  };
}
