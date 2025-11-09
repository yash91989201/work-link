import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Loader2, Plus } from "lucide-react";
import React from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { CreateTeamFormSchema } from "@/lib/schemas/admin/team";
import type { CreateTeamFormType } from "@/lib/types";
import { queryClient, queryUtils } from "@/utils/orpc";

const baseModules = [
  { id: "communication", name: "Communication" },
  { id: "attendance", name: "Attendance" },
];

export const CreateTeamForm = () => {
  const [open, setOpen] = React.useState(false);
  const form = useForm({
    resolver: standardSchemaResolver(CreateTeamFormSchema),
    defaultValues: {
      name: "",
      modules: [...baseModules.map((module) => module.id)],
    },
  });

  const onSubmit: SubmitHandler<CreateTeamFormType> = async (formData) => {
    try {
      const { data, error } = await authClient.organization.createTeam({
        name: formData.name,
      });

      if (error !== null) {
        throw new Error(error.message);
      }

      if (data == null) {
        throw new Error("Failed to create team");
      }

      queryClient.refetchQueries({
        queryKey: queryUtils.admin.team.deleteTeam.mutationKey(),
      });

      toast.success(`${data.name} team created successfully`);
      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="h-4 w-4" />
          Create Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="font-bold text-2xl">
            Create New Team
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a new team to organize your members and projects
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-sm">
                      Team Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-11"
                        placeholder="Enter team name (e.g., Development, Design)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="modules"
                render={() => (
                  <FormItem>
                    <FormLabel className="font-medium text-sm">
                      Base Modules
                    </FormLabel>
                    <div className="space-y-3">
                      {baseModules.map((module) => (
                        <FormField
                          control={form.control}
                          key={module.id}
                          name="modules"
                          render={({ field }) => (
                            <FormItem
                              className="flex flex-row items-start space-x-3 space-y-0"
                              key={module.id}
                            >
                              <FormControl>
                                <Checkbox
                                  checked={(field.value || []).includes(
                                    module.id
                                  )}
                                  disabled
                                  onCheckedChange={(checked) => {
                                    const currentValues = field.value || [];
                                    return checked
                                      ? field.onChange([
                                          ...currentValues,
                                          module.id,
                                        ])
                                      : field.onChange(
                                          currentValues.filter(
                                            (value) => value !== module.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal text-sm">
                                {module.name}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                className="h-11 w-full font-medium"
                disabled={form.formState.isSubmitting}
                type="submit"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Creating Team...</span>
                  </>
                ) : (
                  <span>Create Team</span>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
