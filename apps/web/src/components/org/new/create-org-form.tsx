import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useNavigate } from "@tanstack/react-router";
import { Lock, Unlock } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/dropzone";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { CreateOrgFormSchema } from "@/lib/schemas/org";
import { supabase } from "@/lib/supabase";
import type { CreateOrgFormType } from "@/lib/types";
import { generateSlug } from "@/utils";

export const CreateOrgForm = () => {
  const navigate = useNavigate();

  const form = useForm<CreateOrgFormType>({
    resolver: standardSchemaResolver(CreateOrgFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo: "",
      formState: {
        logo: undefined,
        slugLocked: true,
      },
    },
  });

  const slugLocked = form.watch("formState.slugLocked");

  const onSubmit: SubmitHandler<CreateOrgFormType> = async (values) => {
    try {
      let logoUrl = values.logo;

      if (values.formState.logo) {
        const file = values.formState.logo;
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `org-logo/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("org-logo")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`File upload failed: ${uploadError.message}`);
        }

        logoUrl = uploadData.fullPath;
      }

      const { data: org, error } = await authClient.organization.create({
        ...values,
        logo: logoUrl,
      });

      if (error !== null) {
        throw new Error(error.message);
      }

      if (org === null) {
        throw new Error("Organization creation failed, please try again.");
      }

      navigate({
        to: "/org/$slug",
        params: {
          slug: org.slug,
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="formState.logo"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Organization Logo</FormLabel>
              <FormControl>
                <Dropzone
                  accept={{ "image/*": [] }}
                  maxFiles={1}
                  maxSize={5 * 1024 * 1024}
                  onDrop={(acceptedFiles) => {
                    if (acceptedFiles.length > 0) {
                      onChange(acceptedFiles[0]);
                    }
                  }}
                  src={value ? [value] : undefined}
                  {...field}
                >
                  <DropzoneEmptyState />
                  <DropzoneContent />
                </Dropzone>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Acme Inc."
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);

                    if (slugLocked) {
                      const newSlug = generateSlug(e.target.value || "");
                      form.setValue("slug", newSlug, {
                        shouldDirty: true,
                        shouldTouch: true,
                      });
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Slug</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      placeholder="acme-inc"
                      {...field}
                      disabled={!!slugLocked}
                      onChange={(e) => {
                        if (!slugLocked) {
                          field.onChange(e);
                        }
                      }}
                    />
                  </div>
                  <Button
                    aria-label={slugLocked ? "Unlock slug" : "Lock slug"}
                    onClick={() => {
                      const nextLocked = !slugLocked;

                      // If switching to locked, regenerate from name immediately
                      if (nextLocked) {
                        const newSlug = generateSlug(
                          form.getValues("name") || ""
                        );
                        form.setValue("slug", newSlug, {
                          shouldDirty: true,
                          shouldTouch: true,
                        });
                      }

                      form.setValue("formState.slugLocked", nextLocked, {
                        shouldDirty: true,
                        shouldTouch: true,
                      });
                    }}
                    size="icon"
                    type="button"
                    variant="outline"
                  >
                    {slugLocked ? <Lock size={16} /> : <Unlock size={16} />}
                  </Button>
                </div>
              </FormControl>
              <FormDescription>
                This will be used in the URL of your organization page. Only
                a-z, 0-9 and - are allowed.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating..." : "Create Organization"}
        </Button>
      </form>
    </Form>
  );
};
