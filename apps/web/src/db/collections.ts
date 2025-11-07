import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import {
  AttachmentSchema,
  MessageSchema,
  UserSchema,
} from "@work-link/db/lib/schemas/db-tables";
import { env } from "@/env";

export const messagesCollection = createCollection<typeof MessageSchema>(
  electricCollectionOptions({
    id: "messages",
    syncMode: "eager",
    getKey: (m) => m.id,
    schema: MessageSchema,
    shapeOptions: {
      url: `${env.VITE_SERVER_URL}/rpc/electric/messages`,
      params: {
        table: "message",
      },
    },
  })
);

export const usersCollection = createCollection<typeof UserSchema>(
  electricCollectionOptions({
    id: "users",
    syncMode: "eager",
    schema: UserSchema,
    getKey: (m) => m.id,
    shapeOptions: {
      url: `${env.VITE_SERVER_URL}/rpc/electric/users`,
      params: {
        table: "user",
      },
    },
  })
);
export const attachmentsCollection = createCollection<typeof AttachmentSchema>(
  electricCollectionOptions({
    id: "attachments",
    syncMode: "eager",
    getKey: (m) => m.id,
    schema: AttachmentSchema,
    shapeOptions: {
      url: `${env.VITE_SERVER_URL}/rpc/electric/attachments`,
      params: {
        table: "attachment",
      },
    },
  })
);
