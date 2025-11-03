import { cuid2 } from "drizzle-cuid2/postgres";
import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { organization, team, user } from "./auth";

export const channelTypeEnum = pgEnum("channel_type", [
  "team",
  "group",
  "direct",
]);

export const messageTypeEnum = pgEnum("message_type", [
  "text",
  "attachment",
  "audio",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "message",
  "mention",
  "channel_invite",
  "direct_message",
]);

export const notificationStatusEnum = pgEnum("notification_status", [
  "unread",
  "read",
  "dismissed",
]);

export const attachmentTypeEnum = pgEnum("attachment_type", [
  "image",
  "document",
  "video",
  "audio",
  "archive",
]);

// Join request status
export const joinRequestStatusEnum = pgEnum("join_request_status", [
  "pending",
  "approved",
  "rejected",
]);

// Channels table - represents communication channels
export const channelTable = pgTable("channel", {
  id: cuid2("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: channelTypeEnum("type").notNull().default("team"),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  teamId: text("team_id").references(() => team.id, { onDelete: "cascade" }),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  isPrivate: boolean("is_private").default(false).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
  messageCount: integer("message_count").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});

// Channel members - who has access to which channels
export const channelMemberTable = pgTable(
  "channel_member",
  {
    id: cuid2("id").defaultRandom().primaryKey(),
    channelId: text("channel_id")
      .notNull()
      .references(() => channelTable.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").default("member").notNull(), // member, admin, moderator
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    lastReadAt: timestamp("last_read_at", { withTimezone: true }),
    isMuted: boolean("is_muted").default(false).notNull(),
    notificationSettings: json("notification_settings"), // Custom notification preferences
  },
  (table) => [
    uniqueIndex("unique_channel_user").on(table.channelId, table.userId),
  ]
);

// Channel join requests - for private channels
export const channelJoinRequestTable = pgTable("channel_join_request", {
  id: cuid2("id").defaultRandom().primaryKey(),
  channelId: text("channel_id")
    .notNull()
    .references(() => channelTable.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: joinRequestStatusEnum("status").notNull().default("pending"),
  note: text("note"),
  requestedAt: timestamp("requested_at", { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  reviewedBy: text("reviewed_by").references(() => user.id, {
    onDelete: "set null",
  }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});

// Messages table - all messages across channels and DMs
export const messageTable = pgTable("message", {
  id: cuid2("id").defaultRandom().primaryKey(),
  channelId: text("channel_id").references(() => channelTable.id, {
    onDelete: "cascade",
  }),
  senderId: text("sender_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  receiverId: text("receiver_id").references(() => user.id, {
    onDelete: "cascade",
  }), // For direct messages
  content: text("content"),
  type: messageTypeEnum("type").notNull().default("text"),
  parentMessageId: text("parent_message_id"), // For replies/threads - will be self-referenced
  threadCount: integer("thread_count").default(0).notNull(),
  isEdited: boolean("is_edited").default(false).notNull(),
  editedAt: timestamp("edited_at", { withTimezone: true }),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  pinnedAt: timestamp("pinned_at", { withTimezone: true }),
  pinnedBy: text("pinned_by").references(() => user.id, {
    onDelete: "set null",
  }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  mentions: json("mentions").$type<string[]>(),
  reactions: json("reactions").$type<{ reaction: string; count: number }[]>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});

// File attachments for messages
export const attachmentTable = pgTable("attachment", {
  id: cuid2("id").defaultRandom().primaryKey(),
  messageId: text("message_id")
    .notNull()
    .references(() => messageTable.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  type: attachmentTypeEnum("type").notNull(),
  url: text("url"),
  thumbnailUrl: text("thumbnail_url"),
  uploadedBy: text("uploaded_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});

// Notifications table
export const notificationTable = pgTable("notification", {
  id: cuid2("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  status: notificationStatusEnum("status").notNull().default("unread"),
  title: text("title").notNull(),
  message: text("message"),
  entityId: text("entity_id"), // ID of related entity (message, channel, etc.)
  entityType: text("entity_type"), // Type of entity (message, channel, etc.)
  actionUrl: text("action_url"), // Deep link to the relevant content
  metadata: json("metadata"), // Additional notification data
  readAt: timestamp("read_at", { withTimezone: true }),
  dismissedAt: timestamp("dismissed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
});

// Message read receipts for tracking who has read what
export const messageReadTable = pgTable("message_read", {
  id: cuid2("id").defaultRandom().primaryKey(),
  messageId: text("message_id")
    .notNull()
    .references(() => messageTable.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  readAt: timestamp("read_at", { withTimezone: true })
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
