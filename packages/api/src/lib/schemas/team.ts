import {
  TeamMemberSchema,
  TeamSchema,
  UserSchema,
} from "@work-link/db/lib/schemas/db-tables";
import { z } from "zod";

export const ListTeamsInput = z.void();

export const ListTeamsOutput = z.object({
  teams: z.array(
    TeamSchema.extend({
      teamMembers: z.array(
        TeamMemberSchema.extend({
          user: UserSchema,
        })
      ),
    })
  ),
});

export const AddMemberInput = z.object({
  teamId: z.string(),
  userIds: z.array(z.string()).min(1, "At least one user ID is required"),
});

export const AddMemberOutput = z.object({
  success: z.boolean(),
  message: z.string(),
  addedCount: z.number(),
});

export const RemoveMemberInput = z.object({
  teamId: z.string(),
  userIds: z.array(z.string()).min(1, "At least one user ID is required"),
});

export const RemoveMemberOutput = z.object({
  success: z.boolean(),
  message: z.string(),
  removedCount: z.number(),
});
