import type z from "zod";
import type {
  AccountSchema,
  SessionSchema,
  UserSchema,
  VerificationSchema,
} from "@/lib/schema/auth";

export type AccountType = z.infer<typeof AccountSchema>;
export type SessionType = z.infer<typeof SessionSchema>;
export type UserType = z.infer<typeof UserSchema>;
export type VerificationType = z.infer<typeof VerificationSchema>;
