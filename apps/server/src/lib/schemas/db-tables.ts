import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { attendanceTable } from "@/db/schema";
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
} from "@/db/schema/auth";

export const AccountSchema = createSelectSchema(account);
export const UserSchema = createSelectSchema(user);
export const SessionSchema = createSelectSchema(session);
export const InvitationSchema = createSelectSchema(invitation);
export const MemberSchema = createSelectSchema(member);
export const OrganizationSchema = createSelectSchema(organization);
export const TeamSchema = createSelectSchema(team);
export const TeamMemberSchema = createSelectSchema(teamMember);
export const VerificationSchema = createSelectSchema(verification);
export const AttendanceSchema = createSelectSchema(attendanceTable);

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
