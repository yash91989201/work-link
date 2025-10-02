"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation } from "@tanstack/react-query";
import { LockIcon, MessageSquareIcon } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { JoinChannelRequestFormSchema } from "@/lib/schemas/memeber/join-channel-request";
import type { JoinChannelRequestFormType } from "@/lib/types";
import { queryUtils } from "@/utils/orpc";

interface JoinRequestFormProps {
  channelId: string;
  channelName: string;
  onSuccess?: () => void;
}

export const JoinRequestForm = ({
  channelId,
  channelName,
  onSuccess,
}: JoinRequestFormProps) => {
  const { mutateAsync: joinRequest } = useMutation(
    queryUtils.communication.channel.joinRequest.mutationOptions({
      onSuccess: () => {
        toast.success("Join request sent successfully!");
        onSuccess?.();
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  const form = useForm<JoinChannelRequestFormType>({
    resolver: standardSchemaResolver(JoinChannelRequestFormSchema),
    defaultValues: {
      channelId,
      note: "",
    },
  });

  const onSubmit: SubmitHandler<JoinChannelRequestFormType> = async (
    values
  ) => {
    await joinRequest(values);
    form.reset();
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <LockIcon className="h-8 w-8 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h1 className="max-w-md font-semibold text-2xl">
            Join {channelName} channel
          </h1>
          <p className="text-muted-foreground">
            This is a private channel. Request to join and wait for an admin to
            approve your request.
          </p>
        </div>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem className="text-left">
                  <FormLabel className="flex items-center gap-2">
                    <MessageSquareIcon className="h-4 w-4" />
                    Note (optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none"
                      placeholder="Send a note"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? "Sending Request"
                : "Request to join"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};
