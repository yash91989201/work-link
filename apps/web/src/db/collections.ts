import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import {
  AccountSchema,
  AttachmentSchema,
  AttendanceSchema,
  ChannelJoinRequestSchema,
  ChannelMemberSchema,
  ChannelSchema,
  InvitationSchema,
  MemberSchema,
  MessageReadSchema,
  MessageSchema,
  NotificationSchema,
  OrganizationSchema,
  SessionSchema,
  TeamMemberSchema,
  TeamSchema,
  UserSchema,
  VerificationSchema,
} from "@work-link/db/lib/schemas/db-tables";
import { env } from "@/env";
import { fetchClient } from "@/lib/electric";

export const messagesCollection = createCollection(
  electricCollectionOptions({
    getKey: (m) => m.id,
    schema: MessageSchema,
    shapeOptions: {
      url: `${env.VITE_SERVER_URL}/api/electric/shapes/messages`,
      params: {
        table: "message",
      },
      fetchClient,
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
      fetchClient,
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
      fetchClient,
    },
  })
);

export const accountsCollection = createCollection(
  electricCollectionOptions({
    getKey: (a) => a.id,
    schema: AccountSchema,
    shapeOptions: {
      url: `${env.VITE_SERVER_URL}/api/electric/shapes/accounts`,
      params: {
        table: "account",
      },
      fetchClient,
    },
  })
);

export const sessionsCollection = createCollection(
  electricCollectionOptions({
    getKey: (s) => s.id,
    schema: SessionSchema,
    shapeOptions: {
      url: `${env.VITE_SERVER_URL}/api/electric/shapes/sessions`,
      params: {
        table: "session",
      },
      fetchClient,
    },
  })
);

export const invitationsCollection = createCollection(
  electricCollectionOptions({
    getKey: (i) => i.id,
    schema: InvitationSchema,
    shapeOptions: {
      url: `${env.VITE_SERVER_URL}/api/electric/shapes/invitations`,
      params: {
        table: "invitation",
      },
      fetchClient,
    },
  })
);

export const membersCollection = createCollection(
  electricCollectionOptions({
    getKey: (m) => m.id,
    schema: MemberSchema,
    shapeOptions: {
      url: `${env.VITE_SERVER_URL}/api/electric/shapes/members`,
      params: {
        table: "member",
      },
      fetchClient,
    },
  })
);

export const organizationsCollection = createCollection(
  electricCollectionOptions({
    getKey: (o) => o.id,
    schema: OrganizationSchema,
    shapeOptions: {
      url: `${env.VITE_SERVER_URL}/api/electric/shapes/organizations`,
      params: {
        table: "organization",
      },
      fetchClient,
    },
  })
);

export const teamsCollection = createCollection(
  electricCollectionOptions({
    getKey: (t) => t.id,
    schema: TeamSchema,
    shapeOptions: {
      url: `${env.VITE_SERVER_URL}/api/electric/shapes/teams`,
      params: {
        table: "team",
      },
      fetchClient,
    },
  })
);

export const teamMembersCollection = createCollection(
  electricCollectionOptions({
    getKey: (tm) => tm.id,
    schema: TeamMemberSchema,
    shapeOptions: {
      url: `${env.VITE_SERVER_URL}/api/electric/shapes/team-members`,
      params: {
        table: "teamMember",
      },
      fetchClient,
    },
  })
);

export const verificationsCollection = createCollection(
  electricCollectionOptions({
    getKey: (v) => v.id,
    schema: VerificationSchema,
    shapeOptions: {
      url: `${env.VITE_SERVER_URL}/api/electric/shapes/verifications`,
      params: {
        table: "verification",
      },
      fetchClient,
    },
  })
);

export const attendanceCollection = createCollection(
  electricCollectionOptions({
    getKey: (a) => a.id,
    schema: AttendanceSchema,
    shapeOptions: {
      url: `${env.VITE_SERVER_URL}/api/electric/shapes/attendance`,
      params: {
        table: "attendance",
      },
      fetchClient,
    },
  })
);

export const channelsCollection = createCollection(
  electricCollectionOptions({
    getKey: (c) => c.id,
    schema: ChannelSchema,
    shapeOptions: {
      url: `${env.VITE_SERVER_URL}/api/electric/shapes/channels`,
      params: {
        table: "channel",
      },
      fetchClient,
    },
  })
);

export const channelMembersCollection = createCollection(
  electricCollectionOptions({
    getKey: (cm) => cm.id,
    schema: ChannelMemberSchema,
    shapeOptions: {
      url: `${env.VITE_SERVER_URL}/api/electric/shapes/channel-members`,
      params: {
        table: "channelMember",
      },
      fetchClient,
    },
  })
);

export const notificationsCollection = createCollection(
  electricCollectionOptions({
    getKey: (n) => n.id,
    schema: NotificationSchema,
    shapeOptions: {
      url: `${env.VITE_SERVER_URL}/api/electric/shapes/notifications`,
      params: {
        table: "notification",
      },
      fetchClient,
    },
  })
);

export const messageReadCollection = createCollection(
  electricCollectionOptions({
    getKey: (mr) => mr.id,
    schema: MessageReadSchema,
    shapeOptions: {
      url: `${env.VITE_SERVER_URL}/api/electric/shapes/message-read`,
      params: {
        table: "messageRead",
      },
      fetchClient,
    },
  })
);

export const channelJoinRequestsCollection = createCollection(
  electricCollectionOptions({
    getKey: (cjr) => cjr.id,
    schema: ChannelJoinRequestSchema,
    shapeOptions: {
      url: `${env.VITE_SERVER_URL}/api/electric/shapes/channel-join-requests`,
      params: {
        table: "channelJoinRequest",
      },
      fetchClient,
    },
  })
);
