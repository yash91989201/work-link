import OrgInvitationEmail from "@emails/org-invitation";
import { resend } from "@/utils/resend";

export const sendOrgInvitationEmail = async ({
  invitationLink,
  invitedBy,
  email,
  role,
  orgName,
}: {
  invitationLink: string;
  invitedBy: string;
  email: string;
  role: string;
  orgName: string;
}) => {
  const { data: _, error } = await resend.emails.send({
    from: "Work Link <test@resend.dev",
    to: email,
    subject: "You're invited to join an organization on Work Link",
    react: OrgInvitationEmail({
      invitationLink,
      invitedBy,
      email,
      role,
      organizationName: orgName,
    }),
  });

  return error?.message ?? undefined;
};
