import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { db } from "@/db";
import * as authSchema from "@/db/schema/auth";
import { env } from "@/env";
import { sendOrgInvitationEmail } from "@/lib/email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  trustedOrigins: [...env.CORS_ORIGIN, "work-link://"],
  debug: env.ENV !== "production",
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  plugins: [
    expo(),
    organization({
      teams: {
        enabled: true,
      },
      async sendInvitationEmail(data) {
        const invitationLink = `${env.WEB_URL}/accept-invitation/${data.id}?email=${data.email}`;
        console.log(invitationLink);

        await sendOrgInvitationEmail({
          email: data.email,
          invitationLink,
          invitedBy: data.inviter.user.name,
          role: data.role,
          orgName: data.organization.name,
        });
      },
    }),
  ],
});
