import { createOptimisticAction } from "@tanstack/react-db";
import type {
  CreateMessageInputType,
  UpdateMessageInputType,
} from "@work-link/api/lib/types";
import { attachmentsCollection, messagesCollection } from "@/db/collections";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { orpcClient } from "@/utils/orpc";

export function useMessageMutations() {
  const { user } = useAuthedSession();

  const createMessage = createOptimisticAction({
    onMutate: ({ message }: { message: CreateMessageInputType }) => {
      const messageId = crypto.randomUUID().toString();

      messagesCollection.insert({
        id: messageId,
        channelId: message.channelId,
        content: message.content ?? null,
        type: message.type,
        parentMessageId: message.parentMessageId ?? null,
        isEdited: false,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        editedAt: null,
        isPinned: false,
        mentions: null,
        pinnedAt: null,
        pinnedBy: null,
        reactions: null,
        receiverId: null,
        senderId: user.id,
        threadCount: 0,
      });

      if (message.attachments) {
        for (const attachment of message.attachments) {
          attachmentsCollection.insert({
            id: crypto.randomUUID().toString(),
            fileName: attachment.fileName,
            fileSize: attachment.fileSize,
            mimeType: attachment.mimeType,
            originalName: attachment.originalName,
            type: attachment.type,
            url: attachment.url,
            isPublic: true,
            messageId,
            thumbnailUrl: null,
            uploadedBy: user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
    },
    mutationFn: async ({ message }: { message: CreateMessageInputType }) => {
      const { txid } = await orpcClient.communication.message.create(message);

      await messagesCollection.utils.awaitTxId(txid);
      await attachmentsCollection.utils.awaitTxId(txid);
    },
  });

  const updateMessage = createOptimisticAction({
    onMutate: ({ message }: { message: UpdateMessageInputType }) => {
      messagesCollection.update(message.messageId, (draft) => {
        draft.content = message.content ?? null;
        draft.mentions = message.mentions ?? null;
      });
    },
    mutationFn: async ({ message }: { message: UpdateMessageInputType }) => {
      const { txid } = await orpcClient.communication.message.update(message);

      await messagesCollection.utils.awaitTxId(txid);
      await attachmentsCollection.utils.awaitTxId(txid);
    },
  });

  const deleteMessage = createOptimisticAction({
    onMutate: ({ messageId }: { messageId: string }) => {
      messagesCollection.delete(messageId);
    },
    mutationFn: async ({ messageId }: { messageId: string }) => {
      const { txid } = await orpcClient.communication.message.delete({
        messageId,
      });

      await messagesCollection.utils.awaitTxId(txid);
      await attachmentsCollection.utils.awaitTxId(txid);
    },
  });

  const pinMessage = createOptimisticAction({
    onMutate: ({ messageId }: { messageId: string }) => {
      messagesCollection.update(messageId, (draft) => {
        draft.isPinned = true;
        draft.pinnedAt = new Date();
        draft.pinnedBy = user.id;
      });
    },
    mutationFn: async ({ messageId }: { messageId: string }) => {
      const { txid } = await orpcClient.communication.message.pin({
        messageId,
      });

      await messagesCollection.utils.awaitTxId(txid);
    },
  });

  const unPinMessage = createOptimisticAction({
    onMutate: ({ messageId }: { messageId: string }) => {
      messagesCollection.update(messageId, (draft) => {
        draft.isPinned = false;
      });
    },
    mutationFn: async ({ messageId }: { messageId: string }) => {
      const { txid } = await orpcClient.communication.message.unPin({
        messageId,
      });

      await messagesCollection.utils.awaitTxId(txid);
    },
  });

  return {
    createMessage,
    updateMessage,
    deleteMessage,
    pinMessage,
    unPinMessage,
  };
}
