import { z } from "zod";

export const AddMemberFormSchema = z.object({
  memberIds: z.array(z.string()).min(1, "At least one member must be selected"),
  channelId: z.string().min(1, "Channel ID is required"),
});
