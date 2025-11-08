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
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-background via-background to-muted/20 p-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 ring-2 ring-orange-500/30">
          <LockIcon className="h-10 w-10 text-orange-600" />
        </div>

        <div className="space-y-3">
          <h1 className="max-w-md font-bold text-3xl tracking-tight">
            Join {channelName}
          </h1>
          <p className="text-muted-foreground text-lg">
            This is a private channel. Send a join request and wait for an admin to
            approve your access.
          </p>
        </div>

        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem className="text-left">
                  <FormLabel className="flex items-center gap-2 text-base">
                    <MessageSquareIcon className="h-5 w-5 text-primary" />
                    Add a note (optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[100px] resize-none"
                      placeholder="Let the admins know why you want to join this channel..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              className="w-full h-12 text-base font-semibold" 
              disabled={form.formState.isSubmitting}
              size="lg"
            >
              {form.formState.isSubmitting
                ? "Sending Request..."
                : "Request to Join Channel"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};
