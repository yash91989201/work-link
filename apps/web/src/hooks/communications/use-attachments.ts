import { useQuery } from "@tanstack/react-query";
import { queryUtils } from "@/utils/orpc";

// Query hooks
export const useAttachment = (attachmentId: string) => {
  return useQuery(
    queryUtils.communication.attachments.get.queryOptions({
      input: { attachmentId },
    })
  );
};

export const useMessageAttachments = (messageId: string) => {
  return useQuery(
    queryUtils.communication.attachments.getMessageAttachments.queryOptions({
      input: { messageId },
    })
  );
};

export const useChannelAttachments = (
  channelId: string,
  filters?: {
    type?: "image" | "video" | "audio" | "document" | "other";
    limit?: number;
  }
) => {
  return useQuery(
    queryUtils.communication.attachments.getChannelAttachments.queryOptions({
      input: {
        channelId,
        limit: filters?.limit || 50,
        offset: 0,
        type: filters?.type,
      },
    })
  );
};

export const useUserAttachments = (
  userId: string,
  filters?: {
    type?: "image" | "video" | "audio" | "document" | "other";
    limit?: number;
  }
) => {
  return useQuery(
    queryUtils.communication.attachments.getUserAttachments.queryOptions({
      input: {
        userId,
        limit: filters?.limit || 50,
        offset: 0,
        type: filters?.type,
      },
    })
  );
};
