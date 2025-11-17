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
