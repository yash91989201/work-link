import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuthedSession } from "@/hooks/use-authed-session";
import { CreateChannelFormSchema } from "@/lib/schemas/memeber/channel";
import type { CreateChannelFormType } from "@/lib/types";
import { queryClient, queryUtils } from "@/utils/orpc";
import { MembersSelect, MembersSelectSkeleton } from "./members-select";

export const CreateChannelForm = () => {
  const navigate = useNavigate();
  const { slug } = useParams({ from: "/(authenticated)/org/$slug/(member)" });

  const { session, user } = useAuthedSession();
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm({
    resolver: standardSchemaResolver(CreateChannelFormSchema),
    defaultValues: {
      name: "",
      description: "",
      isPublic: true,
      type: "team",
      memberIds: [],
      createdBy: user.id,
      organizationId: session.activeOrganizationId ?? "",
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

  const onSubmit: SubmitHandler<CreateChannelFormType> = async (formData) => {
    const createChannelRes = await createChannel(formData);
    if (createChannelRes == null) return;

    navigate({
      to: "/org/$slug/communication/channels/$id",
      params: {
        slug,
        id: createChannelRes.id,
      },
    });
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
        <Button className="w-full rounded-sm" size="lg" variant="outline">
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

            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Public Channel</FormLabel>
                    <p className="text-muted-foreground text-sm">
                      Anyone in the team can join this channel.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Suspense fallback={<MembersSelectSkeleton />}>
              <MembersSelect />
            </Suspense>

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
