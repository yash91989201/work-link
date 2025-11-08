import {
  TeamMemberSchema,
  TeamSchema,
} from "@work-link/db/lib/schemas/db-tables";
import { z } from "zod";

export const ListTeamsInput = z.void();

export const ListTeamsOutput = z.object({
  teams: z.array(
    TeamSchema.extend({
      teamMembers: z.array(TeamMemberSchema),
    })
  ),
});
