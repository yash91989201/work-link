import z from "zod";
import {
  ORGANIZATION_NAME_MAX_LENGTH,
  ORGANIZATION_NAME_MIN_LENGTH,
} from "@/lib/constants";

export const CreateOrganizationInput = z.object({
  name: z
    .string()
    .min(ORGANIZATION_NAME_MIN_LENGTH)
    .max(ORGANIZATION_NAME_MAX_LENGTH),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be in kebab-case"),
  logo: z.url().optional(),
});

export const CreateOrganizationOutput = z.object({});
