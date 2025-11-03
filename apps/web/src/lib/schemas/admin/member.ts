import { z } from "zod";

export const InviteMemberFormSchema = z.object({
  email: z.email(),
  teamId: z.string(),
});
