import type z from "zod";
import type {
  AccountSchema,
  SessionSchema,
  UserSchema,
  VerificationSchema,
} from "@/lib/schema/auth";

import type {
  CreateOrganizationInput,
  CreateOrganizationOutput,
} from "@/lib/schema/organization";

export type AccountType = z.infer<typeof AccountSchema>;
export type SessionType = z.infer<typeof SessionSchema>;
export type UserType = z.infer<typeof UserSchema>;
export type VerificationType = z.infer<typeof VerificationSchema>;

export type CreateOrganizationInputType = z.infer<
  typeof CreateOrganizationInput
>;

export type CreateOrganizationOutputType = z.infer<
  typeof CreateOrganizationOutput
>;
