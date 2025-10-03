import { z } from "zod";

export const InviteAdminFormSchema = z.object({
  email: z.email(),
});
