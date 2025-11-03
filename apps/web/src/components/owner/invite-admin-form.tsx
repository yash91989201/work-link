import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Loader2 } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { getAuthQueryKey } from "@/lib/auth/query-keys";
import { authClient } from "@/lib/auth-client";
import { InviteAdminFormSchema } from "@/lib/schemas/owner";
import type { InviteAdminFormType } from "@/lib/types";
import { queryClient } from "@/utils/orpc";

export const InviteAdminForm = () => {
  const { session } = useAuthedSession();
  const orgId = session.activeOrganizationId ?? "";

  const form = useForm({
    resolver: standardSchemaResolver(InviteAdminFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit: SubmitHandler<InviteAdminFormType> = async (formData) => {
    try {
      const { data: _, error } = await authClient.organization.inviteMember({
        email: formData.email,
        role: "admin",
      });

      if (error != null) {
        throw new Error(error.message);
      }

      queryClient.invalidateQueries({
        queryKey: getAuthQueryKey.organization.invitations(orgId),
      });

      toast.success("Admin invitation sent successfully");
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Invite Admin</CardTitle>
        <CardDescription>
          Send an invitation to a new admin member
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="admin@example.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full">
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 />
                  <span>Sending Invitation ...</span>
                </>
              ) : (
                <span>Send Invitation</span>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
