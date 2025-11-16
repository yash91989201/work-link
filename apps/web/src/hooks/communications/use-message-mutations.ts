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

      if (message.parentMessageId) {
        messagesCollection.update(message.parentMessageId, (draft) => {
          draft.threadCount += 1;
        });
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
      const message = messagesCollection.get(messageId);

      if (message?.parentMessageId) {
        messagesCollection.update(message.parentMessageId, (draft) => {
          draft.threadCount = Math.max(0, draft.threadCount - 1);
        });
      }

      const attachmentsToDelete: string[] = [];
      attachmentsCollection.forEach((attachment) => {
        if (attachment.messageId === messageId) {
          attachmentsToDelete.push(attachment.id);
        }
      });

      const childMessagesToDelete: string[] = [];
      messagesCollection.forEach((msg) => {
        if (msg.parentMessageId === messageId) {
          childMessagesToDelete.push(msg.id);
        }
      });

      messagesCollection.delete(messageId);

      if (childMessagesToDelete.length > 0) {
        messagesCollection.delete(childMessagesToDelete);
      }

      if (attachmentsToDelete.length > 0) {
        attachmentsCollection.delete(attachmentsToDelete);
      }
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

  const addReaction = createOptimisticAction({
    onMutate: ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      messagesCollection.update(messageId, (draft) => {
        const reactions = draft.reactions || [];
        const userReaction = reactions.find(
          (r) => r.reaction === emoji && r.userId === user.id
        );

        if (userReaction) return;

        draft.reactions = [
          ...reactions,
          {
            reaction: emoji,
            userId: user.id,
            createdAt: new Date().toISOString(),
          },
        ];
      });
    },
    mutationFn: async ({
      messageId,
      emoji,
    }: {
      messageId: string;
      emoji: string;
    }) => {
      const { txid } = await orpcClient.communication.message.addReaction({
        messageId,
        emoji,
      });

      await messagesCollection.utils.awaitTxId(txid);
    },
  });

  const removeReaction = createOptimisticAction({
    onMutate: ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      messagesCollection.update(messageId, (draft) => {
        draft.reactions = (draft.reactions || []).filter(
          (r) => !(r.reaction === emoji && r.userId === user.id)
        );
      });
    },
    mutationFn: async ({
      messageId,
      emoji,
    }: {
      messageId: string;
      emoji: string;
    }) => {
      const { txid } = await orpcClient.communication.message.removeReaction({
        messageId,
        emoji,
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
    addReaction,
    removeReaction,
  };
}
