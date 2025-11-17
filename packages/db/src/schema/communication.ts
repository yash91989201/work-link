import { cuid2 } from "drizzle-cuid2/postgres";
import { relations } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { organization, team, user } from "./auth";

export const channelTypeEnum = pgEnum("channelType", [
  "team",
  "group",
  "direct",
]);

export const messageTypeEnum = pgEnum("messageType", [
  "text",
  "attachment",
  "audio",
]);

export const notificationTypeEnum = pgEnum("notificationType", [
  "message",
  "mention",
  "channel_invite",
  "direct_message",
]);

export const notificationStatusEnum = pgEnum("notificationStatus", [
  "unread",
  "read",
  "dismissed",
]);

export const attachmentTypeEnum = pgEnum("attachmentType", [
  "image",
  "document",
  "video",
  "audio",
  "archive",
]);

export const joinRequestStatusEnum = pgEnum("joinRequestStatus", [
  "pending",
  "approved",
  "rejected",
]);

export const channelTable = pgTable("channel", {
  id: cuid2().defaultRandom().primaryKey(),
  name: text().notNull(),
  description: text(),
  type: channelTypeEnum().notNull().default("team"),
  organizationId: text()
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  teamId: text().references(() => team.id, { onDelete: "cascade" }),
  createdBy: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  isPrivate: boolean().default(false).notNull(),
  isArchived: boolean().default(false).notNull(),
  lastMessageAt: timestamp({ withTimezone: true }),
  messageCount: integer().default(0).notNull(),
  createdAt: timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});

export const channelMemberTable = pgTable(
  "channelMember",
  {
    id: cuid2().defaultRandom().primaryKey(),
    channelId: text()
      .notNull()
      .references(() => channelTable.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text().default("member").notNull(),
    joinedAt: timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    lastReadAt: timestamp({ withTimezone: true }),
    isMuted: boolean().default(false).notNull(),
    notificationSettings: json(),
  },
  (table) => [
    uniqueIndex("unique_channel_user").on(table.channelId, table.userId),
  ]
);

export const channelJoinRequestTable = pgTable("channelJoinRequest", {
  id: cuid2().defaultRandom().primaryKey(),
  channelId: text()
    .notNull()
    .references(() => channelTable.id, { onDelete: "cascade" }),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: joinRequestStatusEnum().notNull().default("pending"),
  note: text(),
  requestedAt: timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  reviewedBy: text().references(() => user.id, {
    onDelete: "set null",
  }),
  reviewedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});

export const messageTable = pgTable(
  "message",
  {
    id: cuid2().defaultRandom().primaryKey(),
    channelId: text()
      .references(() => channelTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
    senderId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    receiverId: text().references(() => user.id, {
      onDelete: "cascade",
    }),
    content: text(),
    type: messageTypeEnum().notNull().default("text"),
    parentMessageId: text(),
    threadCount: integer().default(0).notNull(),
    isEdited: boolean().default(false).notNull(),
    editedAt: timestamp({ withTimezone: true }),
    isDeleted: boolean().default(false).notNull(),
    isPinned: boolean().default(false).notNull(),
    pinnedAt: timestamp({ withTimezone: true }),
    pinnedBy: text().references(() => user.id, {
      onDelete: "set null",
    }),
    deletedAt: timestamp({ withTimezone: true }),
    mentions: json().$type<string[]>(),
    reactions:
      json().$type<{ reaction: string; userId: string; createdAt: string }[]>(),
    createdAt: timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.parentMessageId],
      foreignColumns: [table.id],
      name: "fk_message_parent",
    }).onDelete("cascade"),
    index("idx_message_parent_message_id").on(table.parentMessageId),
    index("idx_message_is_deleted").on(table.isDeleted),
    index("idx_message_channel_id").on(table.channelId),
    index("idx_message_channel_deleted").on(table.channelId, table.isDeleted),
    index("idx_message_parent_deleted").on(
      table.parentMessageId,
      table.isDeleted
    ),
  ]
);

export const attachmentTable = pgTable("attachment", {
  id: cuid2().defaultRandom().primaryKey(),
  messageId: text()
    .notNull()
    .references(() => messageTable.id, { onDelete: "cascade" }),
  fileName: text().notNull(),
  originalName: text().notNull(),
  fileSize: integer().notNull(),
  mimeType: text().notNull(),
  type: attachmentTypeEnum().notNull(),
  url: text(),
  thumbnailUrl: text(),
  uploadedBy: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  isPublic: boolean().default(false).notNull(),
  createdAt: timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});

export const notificationTable = pgTable("notification", {
  id: cuid2().defaultRandom().primaryKey(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: notificationTypeEnum().notNull(),
  status: notificationStatusEnum().notNull().default("unread"),
  title: text().notNull(),
  message: text(),
  entityId: text(),
  entityType: text(),
  actionUrl: text(),
  metadata: json(),
  readAt: timestamp({ withTimezone: true }),
  dismissedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const messageReadTable = pgTable("messageRead", {
  id: cuid2().defaultRandom().primaryKey(),
  messageId: text()
    .notNull()
    .references(() => messageTable.id, { onDelete: "cascade" }),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  readAt: timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const messageTableRelations = relations(
  messageTable,
  ({ one, many }) => ({
    // Relations to other tables (foreign keys in messageTable)
    channel: one(channelTable, {
      fields: [messageTable.channelId],
      references: [channelTable.id],
    }),
    sender: one(user, {
      fields: [messageTable.senderId],
      references: [user.id],
    }),
    receiver: one(user, {
      fields: [messageTable.receiverId],
      references: [user.id],
    }),
    parentMessage: one(messageTable, {
      fields: [messageTable.parentMessageId],
      references: [messageTable.id],
    }),
    pinnedBy: one(user, {
      fields: [messageTable.pinnedBy],
      references: [user.id],
    }),
    // Inverse relations (other tables reference messageTable)
    attachments: many(attachmentTable),
    reads: many(messageReadTable),
  })
);

// Channel relations
export const channelTableRelations = relations(
  channelTable,
  ({ one, many }) => ({
    organization: one(organization, {
      fields: [channelTable.organizationId],
      references: [organization.id],
    }),
    team: one(team, {
      fields: [channelTable.teamId],
      references: [team.id],
    }),
    creator: one(user, {
      fields: [channelTable.createdBy],
      references: [user.id],
    }),
    members: many(channelMemberTable),
    messages: many(messageTable),
    joinRequests: many(channelJoinRequestTable),
  })
);

// Channel member relations
export const channelMemberTableRelations = relations(
  channelMemberTable,
  ({ one }) => ({
    channel: one(channelTable, {
      fields: [channelMemberTable.channelId],
      references: [channelTable.id],
    }),
    user: one(user, {
      fields: [channelMemberTable.userId],
      references: [user.id],
    }),
  })
);

// Channel join request relations
export const channelJoinRequestTableRelations = relations(
  channelJoinRequestTable,
  ({ one }) => ({
    channel: one(channelTable, {
      fields: [channelJoinRequestTable.channelId],
      references: [channelTable.id],
    }),
    user: one(user, {
      fields: [channelJoinRequestTable.userId],
      references: [user.id],
    }),
    reviewedBy: one(user, {
      fields: [channelJoinRequestTable.reviewedBy],
      references: [user.id],
    }),
  })
);

// Attachment relations
export const attachmentTableRelations = relations(
  attachmentTable,
  ({ one }) => ({
    message: one(messageTable, {
      fields: [attachmentTable.messageId],
      references: [messageTable.id],
    }),
    uploadedBy: one(user, {
      fields: [attachmentTable.uploadedBy],
      references: [user.id],
    }),
  })
);

// Notification relations
export const notificationTableRelations = relations(
  notificationTable,
  ({ one }) => ({
    user: one(user, {
      fields: [notificationTable.userId],
      references: [user.id],
    }),
  })
);

// Message read relations
export const messageReadTableRelations = relations(
  messageReadTable,
  ({ one }) => ({
    message: one(messageTable, {
      fields: [messageReadTable.messageId],
      references: [messageTable.id],
    }),
    user: one(user, {
      fields: [messageReadTable.userId],
      references: [user.id],
    }),
  })
);
