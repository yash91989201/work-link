import type {
  AttachmentType,
  MessageType,
  UserType,
} from "@work-link/db/lib/types";

export function buildMessageWithAttachments(
  message: MessageType,
  sender: UserType
) {
  return {
    ...message,
    sender,
    attachments: [] as AttachmentType[],
  };
}

export function buildOrderedMessages(
  pages: Array<
    Array<{
      message: MessageType;
      sender: UserType;
      attachment: AttachmentType | undefined;
    }>
  >
) {
  if (!pages || pages.length === 0) {
    return [];
  }

  const map = new Map<string, ReturnType<typeof buildMessageWithAttachments>>();

  for (const page of pages) {
    for (const { message, sender, attachment } of page) {
      if (!map.has(message.id)) {
        map.set(message.id, buildMessageWithAttachments(message, sender));
      }

      if (attachment) {
        map.get(message.id)?.attachments.push(attachment);
      }
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}
