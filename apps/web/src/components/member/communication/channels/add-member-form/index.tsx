import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation } from "@tanstack/react-query";
import { Loader, UserPlus } from "lucide-react";
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
import { Form } from "@/components/ui/form";
import { AddMemberFormSchema } from "@/lib/schemas/memeber/add-member";
import type { AddMemberFormType } from "@/lib/types";
import { queryClient, queryUtils } from "@/utils/orpc";
import { AddMembersSelect, AddMembersSelectSkeleton } from "./members-select";

interface AddMemberFormProps {
  channelId: string;
}

export const AddMemberForm = ({ channelId }: AddMemberFormProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<AddMemberFormType>({
    resolver: standardSchemaResolver(AddMemberFormSchema),
    defaultValues: {
      memberIds: [],
      channelId,
    },
  });

  const { mutateAsync: addMembers, isPending } = useMutation(
    queryUtils.communication.channel.addMembers.mutationOptions({
      onSuccess: () => {
        queryClient.refetchQueries({
          queryKey: queryUtils.communication.channel.list.queryKey({
            input: {},
          }),
        });
        toast.success("Members added successfully");
        form.reset();
        setDialogOpen(false);
      },
      onError: (error) => {
        toast.message("Failed to add members", {
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      },
    })
  );

  const onSubmit: SubmitHandler<AddMemberFormType> = async (formData) => {
    await addMembers(formData);
  };

  const onReset = () => {
    form.reset({
      memberIds: [],
      channelId,
    });
  };

  return (
    <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full justify-start rounded-sm"
          title="Add Channel Members"
          variant="outline"
        >
          <UserPlus />
          <span>Add Member</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Members to Channel</DialogTitle>
          <DialogDescription>
            Select team members to add to this channel.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            onReset={onReset}
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <Suspense fallback={<AddMembersSelectSkeleton />}>
              <AddMembersSelect />
            </Suspense>

            <DialogFooter className="flex-row">
              <Button type="reset" variant="outline">
                Reset
              </Button>
              <Button disabled={form.formState.isSubmitting || isPending}>
                {form.formState.isSubmitting || isPending ? (
                  <>
                    <Loader className="mr-1.5 animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <span>Add Members</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
