import z from "zod";
import {
  ORGANIZATION_DESCRIPTION_MAX_LENGTH,
  ORGANIZATION_NAME_MAX_LENGTH,
  ORGANIZATION_NAME_MIN_LENGTH,
} from "@/constants";

export const CreateOrganizationFormSchema = z.object({
  name: z
    .string()
    .min(ORGANIZATION_NAME_MIN_LENGTH, "Name must be at least 2 characters")
    .max(ORGANIZATION_NAME_MAX_LENGTH, "Name must be at most 50 characters"),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Only a-z, 0-9 and - are allowed."),
  description: z
    .string()
    .max(
      ORGANIZATION_DESCRIPTION_MAX_LENGTH,
      "Description must be at most 200 characters"
    )
    .optional(),
});
