import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation } from "@tanstack/react-query";
import { Loader, Plus } from "lucide-react";
import { Suspense, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { CreateChannelFormSchema } from "@/lib/schemas/memeber/channel";
import type { CreateChannelFormType } from "@/lib/types";
import { queryClient, queryUtils } from "@/utils/orpc";
import { MembersSelect, MembersSelectSkeleton } from "./members-select";
import { TeamSelect, TeamSelectSkeleton } from "./team-select";

export const CreateChannelForm = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { user } = useAuthedSession();

  const form = useForm({
    resolver: standardSchemaResolver(CreateChannelFormSchema),
    defaultValues: {
      name: "",
      description: "",
      isPublic: true,
      type: "team",
      teamId: undefined,
      memberIds: [],
      createdBy: user.id,
    },
  });

  const { mutateAsync: createChannel } = useMutation(
    queryUtils.communication.channel.create.mutationOptions({
      onSuccess: () => {
        queryClient.refetchQueries({
          queryKey: queryUtils.communication.channel.list.queryKey({
            input: {},
          }),
        });

        toast.success("Channel created successfully");
        form.reset();
      },
      onError: (error) => {
        toast.message("Failed to create channel", {
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      },
    })
  );

  const channelType = form.watch("type");

  const onSubmit: SubmitHandler<CreateChannelFormType> = async (formData) => {
    const createChannelRes = await createChannel(formData);
    if (createChannelRes == null) return;

    setDialogOpen(false);
  };

  const onReset = () => {
    form.reset({
      name: "",
      description: "",
      isPublic: true,
      type: "team",
    });
  };

  return (
    <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          <span>Create new channel</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Channel</DialogTitle>
          <DialogDescription>
            Create a new channel for your team to communicate and collaborate.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            onReset={onReset}
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter channel name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter channel description"
                      {...field}
                      className="resize-none"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Type</FormLabel>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select channel type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="group">Group</SelectItem>
                      <SelectItem value="direct">Direct</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {channelType === "team" ? (
              <Suspense fallback={<TeamSelectSkeleton />}>
                <TeamSelect />
              </Suspense>
            ) : (
              <Suspense fallback={<MembersSelectSkeleton />}>
                <MembersSelect />
              </Suspense>
            )}

            <DialogFooter className="flex-row">
              <Button type="reset" variant="outline">
                Reset
              </Button>
              <Button disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader className="mr-1.5 animate-spin" />
                    <span>Creating ...</span>
                  </>
                ) : (
                  <span>Create Channel</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
