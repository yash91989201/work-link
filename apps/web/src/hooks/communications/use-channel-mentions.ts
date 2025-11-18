import { and, eq, isNull, useLiveQuery } from "@tanstack/react-db";
import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  attachmentsCollection,
  messagesCollection,
  usersCollection,
} from "@/db/collections";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { buildMessageWithAttachments } from "@/lib/communications/message";
import { extractMentionIdsFromContent } from "@/lib/mentions";

export function useChannelMentions() {
  const { id: channelId } = useParams({
    from: "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels/$id",
  });

  const { user } = useAuthedSession();
  const userId = user.id;

  const { data, isLoading } = useLiveQuery(
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
          and(eq(message.channelId, channelId), isNull(message.deletedAt))
        )
        .orderBy(({ message }) => message.createdAt, "desc")
        .select(({ message, sender, attachment }) => ({
          message,
          sender,
          attachment,
        })),
    [channelId, userId]
  );

  const mentions = useMemo(() => {
    if (!(data && Array.isArray(data) && userId)) {
      return [];
    }

    const map = new Map<
      string,
      ReturnType<typeof buildMessageWithAttachments>
    >();

    for (const { message, sender, attachment } of data) {
      let entry = map.get(message.id);

      if (!entry) {
        entry = buildMessageWithAttachments(message, sender);
        map.set(message.id, entry);
      }

      if (attachment) {
        entry.attachments.push(attachment);
      }
    }

    const getMentionIds = (
      content: string | null,
      mentions?: string[] | null
    ) => {
      if (Array.isArray(mentions) && mentions.length > 0) {
        return mentions;
      }
      return extractMentionIdsFromContent(content) ?? [];
    };

    return Array.from(map.values())
      .filter((message) => {
        const mentionIds = getMentionIds(
          message.content ?? null,
          message.mentions
        );
        if (!mentionIds.length) return false;
        if (!Array.isArray(message.mentions) || message.mentions.length === 0) {
          message.mentions = mentionIds.length ? mentionIds : null;
        }
        return mentionIds.includes(userId);
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [data, userId]);

  return {
    mentions,
    mentionCount: mentions.length,
    isLoading,
  };
}
