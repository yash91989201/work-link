import { ORPCError } from "@orpc/server";

import { and, desc, eq, inArray, sql } from "drizzle-orm";
import type { Context } from "@/lib/context";
import { protectedProcedure } from "@/lib/orpc";
import {
  CreateAnnouncementNotificationInput,
  CreateBulkNotificationsInput,
  CreateChannelInviteNotificationInput,
  CreateNotificationInput,
  CreateSystemNotificationInput,
  DeleteNotificationInput,
  DismissNotificationInput,
  GetNotificationsInput,
  MarkMultipleAsReadInput,
  MarkNotificationAsReadInput,
  NotificationOutput,
  NotificationsListOutput,
  SuccessOutput,
  UnreadCountOutput,
} from "@/lib/schemas/notification";
import { channelTable, notificationTable } from "@/db/schema/communication";
import { member, user as userTable } from "@/db/schema/auth";

type Database = Context["db"];

type NotificationStatus = (typeof notificationTable.status.enumValues)[number];
type NotificationType = (typeof notificationTable.type.enumValues)[number];

const createNotificationRecord = async (
  db: Database,
  data: {
    userId: string;
    type: NotificationType;
    title: string;
    message?: string;
    entityId?: string;
    entityType?: string;
    actionUrl?: string;
  }
) => {
  const [notification] = await db
    .insert(notificationTable)
    .values({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      entityId: data.entityId,
      entityType: data.entityType,
      actionUrl: data.actionUrl,
    })
    .returning();

  return notification;
};

const createBulkNotificationRecords = (
  db: Database,
  notifications: Array<{
    userId: string;
    type: NotificationType;
    title: string;
    message?: string;
    entityId?: string;
    entityType?: string;
    actionUrl?: string;
  }>
) => {
  if (notifications.length === 0) {
    return [];
  }

  return db.insert(notificationTable).values(notifications).returning();
};

const getUserNotificationsList = (
  db: Database,
  userId: string,
  options: {
    limit: number;
    offset: number;
    status?: NotificationStatus;
    type?: NotificationType;
  }
) => {
  let query = db
    .select({
      id: notificationTable.id,
      userId: notificationTable.userId,
      type: notificationTable.type,
      status: notificationTable.status,
      title: notificationTable.title,
      message: notificationTable.message,
      entityId: notificationTable.entityId,
      entityType: notificationTable.entityType,
      actionUrl: notificationTable.actionUrl,
      metadata: notificationTable.metadata,
      readAt: notificationTable.readAt,
      dismissedAt: notificationTable.dismissedAt,
      createdAt: notificationTable.createdAt,
    })
    .from(notificationTable)
    .where(eq(notificationTable.userId, userId))
    .orderBy(desc(notificationTable.createdAt))
    .limit(options.limit)
    .offset(options.offset)
    .$dynamic();

  if (options.status) {
    query = query.where(eq(notificationTable.status, options.status));
  }

  if (options.type) {
    query = query.where(eq(notificationTable.type, options.type));
  }

  return query;
};

const countUserNotifications = async (
  db: Database,
  userId: string,
  options: { status?: NotificationStatus; type?: NotificationType }
) => {
  let query = db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(notificationTable)
    .where(eq(notificationTable.userId, userId))
    .$dynamic();

  if (options.status) {
    query = query.where(eq(notificationTable.status, options.status));
  }

  if (options.type) {
    query = query.where(eq(notificationTable.type, options.type));
  }

  const [result] = await query;
  return result?.count ?? 0;
};

const getUnreadNotificationCount = async (db: Database, userId: string) => {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notificationTable)
    .where(
      and(
        eq(notificationTable.userId, userId),
        eq(notificationTable.status, "unread")
      )
    );

  return result?.count ?? 0;
};

const markNotificationAsReadRecord = async (
  db: Database,
  notificationId: string,
  userId: string
) => {
  const [notification] = await db
    .update(notificationTable)
    .set({
      status: "read",
      readAt: new Date(),
    })
    .where(
      and(
        eq(notificationTable.id, notificationId),
        eq(notificationTable.userId, userId)
      )
    )
    .returning();

  return notification ?? null;
};

const markMultipleNotificationsRead = async (
  db: Database,
  notificationIds: string[],
  userId: string
) => {
  if (notificationIds.length === 0) {
    return;
  }

  await db
    .update(notificationTable)
    .set({
      status: "read",
      readAt: new Date(),
    })
    .where(
      and(
        inArray(notificationTable.id, notificationIds),
        eq(notificationTable.userId, userId)
      )
    );
};

const markAllNotificationsRead = async (db: Database, userId: string) => {
  await db
    .update(notificationTable)
    .set({
      status: "read",
      readAt: new Date(),
    })
    .where(
      and(
        eq(notificationTable.userId, userId),
        eq(notificationTable.status, "unread")
      )
    );
};

const dismissNotificationRecord = async (
  db: Database,
  notificationId: string,
  userId: string
) => {
  const [notification] = await db
    .update(notificationTable)
    .set({
      status: "dismissed",
      dismissedAt: new Date(),
    })
    .where(
      and(
        eq(notificationTable.id, notificationId),
        eq(notificationTable.userId, userId)
      )
    )
    .returning();

  return notification ?? null;
};

const deleteNotificationRecord = async (
  db: Database,
  notificationId: string,
  userId: string
) => {
  await db
    .delete(notificationTable)
    .where(
      and(
        eq(notificationTable.id, notificationId),
        eq(notificationTable.userId, userId)
      )
    );
};

const createChannelInviteNotificationRecord = async (
  db: Database,
  channelId: string,
  invitedUserId: string,
  invitedByUserId: string
) => {
  const channel = await db.query.channelTable.findFirst({
    where: eq(channelTable.id, channelId),
  });

  if (!channel) {
    return;
  }

  const inviter = await db.query.user.findFirst({
    where: eq(userTable.id, invitedByUserId),
  });

  if (!inviter) {
    return;
  }

  await createNotificationRecord(db, {
    userId: invitedUserId,
    type: "channel_invite",
    title: `Invited to #${channel.name}`,
    message: `${inviter.name} invited you to join the ${channel.name} channel`,
    entityId: channelId,
    entityType: "channel",
    actionUrl: `/communication/channels/${channelId}`,
  });
};

const createSystemNotificationRecords = async (
  db: Database,
  userIds: string[],
  title: string,
  message: string,
  actionUrl?: string
) => {
  if (userIds.length === 0) {
    return;
  }

  await createBulkNotificationRecords(
    db,
    userIds.map((userId) => ({
      userId,
      type: "system",
      title,
      message,
      actionUrl,
    }))
  );
};

const createAnnouncementNotificationRecords = async (
  db: Database,
  organizationId: string,
  title: string,
  message: string,
  actionUrl?: string
) => {
  const members = await db
    .select({ userId: member.userId })
    .from(member)
    .where(eq(member.organizationId, organizationId));

  if (members.length === 0) {
    return;
  }

  await createBulkNotificationRecords(
    db,
    members.map((record) => ({
      userId: record.userId,
      type: "announcement",
      title,
      message,
      actionUrl,
    }))
  );
};

export const notificationsRouter = {
  // Get user's notifications with pagination and filtering
  list: protectedProcedure
    .input(GetNotificationsInput)
    .output(NotificationsListOutput)
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const currentUser = session.user;

      const notifications = await getUserNotificationsList(db, currentUser.id, {
        limit: input.limit,
        offset: input.offset,
        status: input.status as NotificationStatus | undefined,
        type: input.type as NotificationType | undefined,
      });

      const total = await countUserNotifications(db, currentUser.id, {
        status: input.status as NotificationStatus | undefined,
        type: input.type as NotificationType | undefined,
      });

      return {
        notifications: notifications.map((notification) =>
          NotificationOutput.parse(notification)
        ),
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Get unread notification count
  getUnreadCount: protectedProcedure
    .output(UnreadCountOutput)
    .handler(async ({ context }) => {
      const { db, session } = context;
      const user = session.user;

      const count = await getUnreadNotificationCount(db, user.id);

      return { count };
    }),

  // Mark single notification as read
  markAsRead: protectedProcedure
    .input(MarkNotificationAsReadInput)
    .output(NotificationOutput.nullable())
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const user = session.user;

      const updated = await markNotificationAsReadRecord(
        db,
        input.notificationId,
        user.id
      );

      if (!updated) {
        throw new ORPCError("NOT_FOUND", {
          message: "Notification not found or you don't have access to it.",
        });
      }

      return NotificationOutput.parse(updated);
    }),

  // Mark multiple notifications as read
  markMultipleAsRead: protectedProcedure
    .input(MarkMultipleAsReadInput)
    .output(SuccessOutput)
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const user = session.user;

      await markMultipleNotificationsRead(db, input.notificationIds, user.id);

      return {
        success: true,
        message: "Notifications marked as read successfully.",
      };
    }),

  // Mark all notifications as read
  markAllAsRead: protectedProcedure
    .output(SuccessOutput)
    .handler(async ({ context }) => {
      const { db, session } = context;
      const user = session.user;

      await markAllNotificationsRead(db, user.id);

      return {
        success: true,
        message: "All notifications marked as read.",
      };
    }),

  // Dismiss a notification
  dismiss: protectedProcedure
    .input(DismissNotificationInput)
    .output(NotificationOutput.nullable())
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const user = session.user;

      const dismissed = await dismissNotificationRecord(
        db,
        input.notificationId,
        user.id
      );

      if (!dismissed) {
        throw new ORPCError("NOT_FOUND", {
          message: "Notification not found or you don't have access to it.",
        });
      }

      return NotificationOutput.parse(dismissed);
    }),

  // Delete a notification
  delete: protectedProcedure
    .input(DeleteNotificationInput)
    .output(SuccessOutput)
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const user = session.user;

      await deleteNotificationRecord(db, input.notificationId, user.id);

      return {
        success: true,
        message: "Notification deleted successfully.",
      };
    }),

  // Create a single notification (admin/system use)
  create: protectedProcedure
    .input(CreateNotificationInput)
    .output(NotificationOutput)
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const user = session.user;
      const orgId = session.session.activeOrganizationId;

      if (!orgId) {
        throw new ORPCError("NOT_FOUND", {
          message: "Organization not found.",
        });
      }

      const membership = await db.query.member.findFirst({
        where: and(
          eq(member.organizationId, orgId),
          eq(member.userId, user.id)
        ),
      });

      if (!(membership && ["admin", "moderator"].includes(membership.role))) {
        throw new ORPCError("FORBIDDEN", {
          message: "You don't have permission to create notifications.",
        });
      }

      const notification = await createNotificationRecord(db, {
        userId: input.userId,
        type: input.type as NotificationType,
        title: input.title,
        message: input.message,
        entityId: input.entityId,
        entityType: input.entityType,
        actionUrl: input.actionUrl,
      });

      return NotificationOutput.parse(notification);
    }),

  // Create bulk notifications (admin/system use)
  createBulk: protectedProcedure
    .input(CreateBulkNotificationsInput)
    .output(SuccessOutput)
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const user = session.user;
      const orgId = session.session.activeOrganizationId;

      if (!orgId) {
        throw new ORPCError("NOT_FOUND", {
          message: "Organization not found.",
        });
      }

      const membership = await db.query.member.findFirst({
        where: and(
          eq(member.organizationId, orgId),
          eq(member.userId, user.id)
        ),
      });

      if (!(membership && ["admin", "moderator"].includes(membership.role))) {
        throw new ORPCError("FORBIDDEN", {
          message: "You don't have permission to create bulk notifications.",
        });
      }

      await createBulkNotificationRecords(
        db,
        input.notifications.map((notification) => ({
          userId: notification.userId,
          type: notification.type as NotificationType,
          title: notification.title,
          message: notification.message,
          entityId: notification.entityId,
          entityType: notification.entityType,
          actionUrl: notification.actionUrl,
        }))
      );

      return {
        success: true,
        message: `Created ${input.notifications.length} notifications successfully.`,
      };
    }),

  // Create channel invite notification
  createChannelInvite: protectedProcedure
    .input(CreateChannelInviteNotificationInput)
    .output(SuccessOutput)
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const user = session.user;

      await createChannelInviteNotificationRecord(
        db,
        input.channelId,
        input.invitedUserId,
        user.id
      );

      return {
        success: true,
        message: "Channel invite notification created successfully.",
      };
    }),

  // Create system notification for multiple users (admin only)
  createSystem: protectedProcedure
    .input(CreateSystemNotificationInput)
    .output(SuccessOutput)
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const user = session.user;
      const orgId = session.session.activeOrganizationId;

      if (!orgId) {
        throw new ORPCError("NOT_FOUND", {
          message: "Organization not found.",
        });
      }

      const membership = await db.query.member.findFirst({
        where: and(
          eq(member.organizationId, orgId),
          eq(member.userId, user.id)
        ),
      });

      if (!membership || membership.role !== "admin") {
        throw new ORPCError("FORBIDDEN", {
          message: "You don't have permission to create system notifications.",
        });
      }

      await createSystemNotificationRecords(
        db,
        input.userIds,
        input.title,
        input.message ?? "",
        input.actionUrl
      );

      return {
        success: true,
        message: `System notification sent to ${input.userIds.length} users.`,
      };
    }),

  // Create organization-wide announcement (admin only)
  createAnnouncement: protectedProcedure
    .input(CreateAnnouncementNotificationInput)
    .output(SuccessOutput)
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const user = session.user;
      const orgId = session.session.activeOrganizationId;

      if (!orgId) {
        throw new ORPCError("NOT_FOUND", {
          message: "Organization not found.",
        });
      }

      const membership = await db.query.member.findFirst({
        where: and(
          eq(member.organizationId, orgId),
          eq(member.userId, user.id)
        ),
      });

      if (!membership || membership.role !== "admin") {
        throw new ORPCError("FORBIDDEN", {
          message: "You don't have permission to create announcements.",
        });
      }

      await createAnnouncementNotificationRecords(
        db,
        orgId,
        input.title,
        input.message,
        input.actionUrl
      );

      return {
        success: true,
        message: "Announcement sent to all organization members.",
      };
    }),
};
