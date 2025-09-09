import { createSelectSchema } from "drizzle-zod";
import { account, session, user, verification } from "@/db/schema/auth";

export const AccountSchema = createSelectSchema(account);
export const SessionSchema = createSelectSchema(session);
export const UserSchema = createSelectSchema(user);
export const VerificationSchema = createSelectSchema(verification);
