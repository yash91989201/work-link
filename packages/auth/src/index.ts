import { expo } from "@better-auth/expo";
import { db } from "@work-link/db";
import * as authSchema from "@work-link/db/schema/auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
    camelCase: true,
  }),
  trustedOrigins: [process.env.CORS_ORIGIN as string, "work-link://"],
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
      // sendInvitationEmail(data) {
      //   const invitationLink = `${env.WEB_URL}/accept-invitation/${data.id}?email=${data.email}`;
      //
      //   await sendOrgInvitationEmail({
      //     email: data.email,
      //     invitationLink,
      //     invitedBy: data.inviter.user.name,
      //     role: data.role,
      //     orgName: data.organization.name,
      //   });
      // },
    }),
  ],
});
