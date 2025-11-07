import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import {
  AttachmentSchema,
  MessageSchema,
  UserSchema,
} from "@work-link/db/lib/schemas/db-tables";
import { env } from "@/env";

export const messagesCollection = createCollection(
  electricCollectionOptions({
    getKey: (m) => m.id,
    schema: MessageSchema,
    shapeOptions: {
      url: `${env.VITE_SERVER_URL}/api/electric/shapes/messages`,
      params: {
        table: "message",
      },
      fetchClient: (url, init) =>
        fetch(url, {
          ...init,
          credentials: "include",
        }),
    },
  })
);

export const usersCollection = createCollection(
  electricCollectionOptions({
    schema: UserSchema,
    getKey: (m) => m.id,
    shapeOptions: {
      url: `${env.VITE_SERVER_URL}/api/electric/shapes/users`,
      params: {
        table: "user",
      },
      fetchClient: (url, init) =>
        fetch(url, {
          ...init,
          credentials: "include",
        }),
    },
  })
);
export const attachmentsCollection = createCollection(
  electricCollectionOptions({
    getKey: (m) => m.id,
    schema: AttachmentSchema,
    shapeOptions: {
      url: `${env.VITE_SERVER_URL}/api/electric/shapes/attachments`,
      params: {
        table: "attachment",
      },
      fetchClient: (url, init) =>
        fetch(url, {
          ...init,
          credentials: "include",
        }),
    },
  })
);
