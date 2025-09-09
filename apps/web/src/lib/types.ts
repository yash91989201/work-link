import type z from "zod";
import type { CreateOrganizationFormSchema } from "@/lib/schemas/organization";

export type CreateOrganizationFormSchemaType = z.infer<
  typeof CreateOrganizationFormSchema
>;
