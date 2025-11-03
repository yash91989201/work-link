import { z } from "zod";

export const RoleSchema = z.enum(["owner", "admin", "member"]);

export const FeatureSchema = z.object({
  id: z.string().min(3),
  name: z.string().min(3),
  roles: z.array(RoleSchema).optional(),
});

export const ModuleSchema = z.object({
  id: z.string().min(3),
  name: z.string().min(3),
  description: z.string().min(3).optional(),
  features: z.array(FeatureSchema).min(1),
});
