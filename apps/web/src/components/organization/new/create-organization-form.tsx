import { Pen, PenOff } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppForm } from "@/components/ui/tanstack-form";
import { CreateOrganizationFormSchema } from "@/lib/schemas/organization";
import type { CreateOrganizationFormSchemaType } from "@/lib/types/organization";

export const CreateOrganizationForm = () => {
  // Utility to generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };

  // Slug edit mode state
  const [isSlugEditable, setIsSlugEditable] = useState(false);
  const form = useAppForm({
    validators: {
      onBlur: CreateOrganizationFormSchema,
    },
    defaultValues: {
      name: "",
      slug: "",
    } as CreateOrganizationFormSchemaType,
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    },
    [form]
  );

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Create Organization</CardTitle>
        <CardDescription>
          Fill in the details below to create a new organization.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form.AppForm>
          <form className="space-y-3" noValidate onSubmit={handleSubmit}>
            <form.AppField name="name">
              {(field) => (
                <field.FormItem className="space-y-1.5">
                  <field.FormLabel>Organization Name</field.FormLabel>
                  <field.FormControl>
                    <Input
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.handleChange(val);
                        // Auto-generate slug from name when slug isn't being edited
                        if (!isSlugEditable) {
                          // Use the form API to set the slug field value
                          // setFieldValue accepts either a value or an updater function
                          form.setFieldValue?.("slug", generateSlug(val));
                        }
                      }}
                      placeholder="My Organization"
                      value={field.state.value}
                    />
                  </field.FormControl>
                  <field.FormDescription className="text-xs">
                    This is your organization name.
                  </field.FormDescription>
                  <field.FormMessage className="text-xs" />
                </field.FormItem>
              )}
            </form.AppField>
            {/* Slug Field */}
            <form.AppField name="slug">
              {(field) => (
                <field.FormItem className="space-y-1.5">
                  <field.FormLabel>Organization Slug</field.FormLabel>
                  <field.FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        disabled={!isSlugEditable}
                        onChange={(e) => {
                          field.handleChange(e.target.value);
                        }}
                        placeholder="organization-slug"
                        readOnly={!isSlugEditable}
                        value={field.state.value}
                      />
                      <Button
                        onClick={() => setIsSlugEditable((edit) => !edit)}
                        size="icon"
                        variant="outline"
                      >
                        {isSlugEditable ? (
                          <PenOff className="size-4" />
                        ) : (
                          <Pen className="size-4" />
                        )}
                      </Button>
                    </div>
                  </field.FormControl>
                  <field.FormDescription className="text-xs">
                    The slug is used as your organization's URL identifier.
                  </field.FormDescription>
                  <field.FormMessage className="text-xs" />
                </field.FormItem>
              )}
            </form.AppField>
            <form.AppField name="description">
              {(field) => (
                <field.FormItem className="space-y-1.5">
                  <field.FormLabel>
                    Organization Description (Optional)
                  </field.FormLabel>
                  <field.FormControl>
                    <Input
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Description"
                      value={field.state.value}
                    />
                  </field.FormControl>
                  <field.FormDescription className="text-xs">
                    A small description for your Organization.
                  </field.FormDescription>
                  <field.FormMessage className="text-xs" />
                </field.FormItem>
              )}
            </form.AppField>
          </form>
        </form.AppForm>
      </CardContent>
    </Card>
  );
};
