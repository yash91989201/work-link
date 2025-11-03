import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Lock, Unlock } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Image } from "@/components/shared/image";
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
    resolver: zodResolver(CreateOrgFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      formState: {
        slugLocked: true,
      },
    },
  });

  const slugLocked = form.watch("formState.slugLocked");
  const isSlugValidating = form.formState.validatingFields?.slug;

  const onSubmit: SubmitHandler<CreateOrgFormType> = async (values) => {
    try {
      let logo = values.logo;

      if (values.formState.logo) {
        const file = values.formState.logo;
        const filePath = file.name;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("org-logo")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`File upload failed: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from("org-logo")
          .getPublicUrl(uploadData.path);

        logo = urlData.publicUrl;
      }

      const { data: org, error } = await authClient.organization.create({
        ...values,
        logo,
      });

      if (error !== null) {
        throw new Error(error.message);
      }

      if (org === null) {
        throw new Error("Organization creation failed, please try again.");
      }

      navigate({
        to: "/org/$slug/manage",
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
        <div className="flex flex-col items-center space-y-4">
          <Image
            alt="Work Link"
            className="rounded-lg"
            height={120}
            src="/logo.webp"
            width={120}
          />
        </div>
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
                        shouldValidate: true,
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
                      onBlur={field.onBlur}
                      onChange={(e) => {
                        if (!slugLocked) {
                          field.onChange(e);
                        }
                      }}
                    />
                    {isSlugValidating && (
                      <div className="-translate-y-1/2 absolute top-1/2 right-3">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <Button
                    aria-label={slugLocked ? "Unlock slug" : "Lock slug"}
                    onClick={() => {
                      const nextLocked = !slugLocked;

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
                This will be a unique name for your Organization. Only a-z, 0-9
                and hypens are allowed.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="gap-1.5" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Organization"
          )}
        </Button>
      </form>
    </Form>
  );
};
