import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";
import { attendanceTable, workBlockTable } from "@/schema";
import {
  account,
  invitation,
  member,
  organization,
  session,
  team,
  teamMember,
  user,
  verification,
} from "@/schema/auth";
import {
  attachmentTable,
  channelJoinRequestTable,
  channelMemberTable,
  channelTable,
  messageReadTable,
  messageTable,
  notificationTable,
} from "@/schema/communication";

export const AccountSchema = createSelectSchema(account);
export const UserSchema = createSelectSchema(user, {
  image: z.url().nullable().optional(),
});
export const SessionSchema = createSelectSchema(session);
export const InvitationSchema = createSelectSchema(invitation);
export const MemberSchema = createSelectSchema(member);
export const OrganizationSchema = createSelectSchema(organization);
export const TeamSchema = createSelectSchema(team);
export const TeamMemberSchema = createSelectSchema(teamMember);
export const VerificationSchema = createSelectSchema(verification);
export const AttendanceSchema = createSelectSchema(attendanceTable);
export const WorkBlockSchema = createSelectSchema(workBlockTable);

export const AccountUpdateSchema = createUpdateSchema(account);
export const UserUpdateSchema = createUpdateSchema(user);
export const SessionUpdateSchema = createUpdateSchema(session);
export const InvitationUpdateSchema = createUpdateSchema(invitation);
export const MemberUpdateSchema = createUpdateSchema(member);
export const OrganizationUpdateSchema = createUpdateSchema(organization);
export const TeamUpdateSchema = createUpdateSchema(team);
export const TeamMemberUpdateSchema = createUpdateSchema(teamMember);
export const VerificationUpdateSchema = createUpdateSchema(verification);
export const AttendanceUpdateSchema = createUpdateSchema(attendanceTable);
export const WorkBlockUpdateSchema = createUpdateSchema(workBlockTable);

export const AccountInsertSchema = createInsertSchema(account);
export const UserInsertSchema = createInsertSchema(user);
export const SessionInsertSchema = createInsertSchema(session);
export const InvitationInsertSchema = createInsertSchema(invitation);
export const MemberInsertSchema = createInsertSchema(member);
export const OrganizationInsertSchema = createInsertSchema(organization);
export const TeamInsertSchema = createInsertSchema(team);
export const TeamMemberInsertSchema = createInsertSchema(teamMember);
export const VerificationInsertSchema = createInsertSchema(verification);
export const AttendanceInsertSchema = createInsertSchema(attendanceTable);
export const WorkBlockInsertSchema = createInsertSchema(workBlockTable);

export const ChannelSchema = createSelectSchema(channelTable);
export const ChannelMemberSchema = createSelectSchema(channelMemberTable);
export const MessageSchema = createSelectSchema(messageTable);
export const AttachmentSchema = createSelectSchema(attachmentTable);
export const NotificationSchema = createSelectSchema(notificationTable);
export const MessageReadSchema = createSelectSchema(messageReadTable);

export const ChannelUpdateSchema = createUpdateSchema(channelTable);
export const ChannelMemberUpdateSchema = createUpdateSchema(channelMemberTable);
export const MessageUpdateSchema = createUpdateSchema(messageTable);
export const AttachmentUpdateSchema = createUpdateSchema(attachmentTable);
export const NotificationUpdateSchema = createUpdateSchema(notificationTable);
export const MessageReadUpdateSchema = createUpdateSchema(messageReadTable);

export const ChannelInsertSchema = createInsertSchema(channelTable);
export const ChannelMemberInsertSchema = createInsertSchema(channelMemberTable);
export const MessageInsertSchema = createInsertSchema(messageTable);
export const AttachmentInsertSchema = createInsertSchema(attachmentTable);
export const NotificationInsertSchema = createInsertSchema(notificationTable);
export const MessageReadInsertSchema = createInsertSchema(messageReadTable);

export const ChannelTypeSchema = ChannelSchema.shape.type;
export const ChannelJoinRequestSchema = createSelectSchema(
  channelJoinRequestTable
);
export const ChannelJoinRequestUpdateSchema = createUpdateSchema(
  channelJoinRequestTable
);
export const ChannelJoinRequestInsertSchema = createInsertSchema(
  channelJoinRequestTable
);
