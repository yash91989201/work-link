import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronDown, RefreshCw, User, Users } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  MultiSelect,
  type MultiSelectOption,
} from "@/components/ui/multi-select";
import { getAuthQueryKey } from "@/lib/auth/query-keys";
import { authClient } from "@/lib/auth-client";
import type { CreateChannelFormType } from "@/lib/types";
import { cn } from "@/lib/utils";

export const MembersSelect = () => {
  const form = useFormContext<CreateChannelFormType>();
  const channelType = form.watch("type");

  const {
    data: membersData,
    refetch: refetchTeamMembers,
    isRefetching,
  } = useSuspenseQuery({
    queryKey: getAuthQueryKey.organization.members("current"),
    queryFn: async () => {
      const result = await authClient.organization.listMembers();
      return result.data?.members || [];
    },
  });

  const memberOptions: MultiSelectOption[] = membersData.map((member) => ({
    label: member.user.email,
    value: member.userId,
    icon: () => (
      <Avatar className="size-6">
        <AvatarImage src={member.user?.image || ""} />
        <AvatarFallback>
          {member.user.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    ),
  }));

  const filteredOptions =
    channelType === "direct" ? memberOptions : memberOptions;

  return (
    <FormField
      control={form.control}
      name="memberIds"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            <span className="flex-1">Members</span>
            <Badge className="ml-2" variant="secondary">
              {channelType === "direct" ? (
                <>
                  <span>1</span>
                  <User />
                </>
              ) : (
                <>
                  <span>1+</span>
                  <Users />
                </>
              )}
            </Badge>
            <Button
              className="size-6 rounded-sm"
              disabled={isRefetching}
              onClick={() => refetchTeamMembers()}
              size="icon"
              type="button"
              variant="outline"
            >
              <RefreshCw
                className={cn("size-3", isRefetching && "animate-spin")}
              />
            </Button>
          </FormLabel>
          <FormControl>
            <MultiSelect
              className="w-full"
              maxCount={1}
              onValueChange={field.onChange}
              options={filteredOptions}
              placeholder={
                channelType === "direct"
                  ? "Select team member"
                  : "Select channel members"
              }
              value={field.value}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export function MembersSelectSkeleton() {
  const form = useFormContext<CreateChannelFormType>();
  const channelType = form.watch("type");
  return (
    <FormField
      control={form.control}
      name="memberIds"
      render={() => (
        <FormItem>
          <FormLabel>
            <span className="flex-1">Members</span>
            <Badge className="ml-2" variant="secondary">
              {channelType === "direct" ? (
                <>
                  <span>1</span>
                  <User />
                </>
              ) : (
                <>
                  <span>1+</span>
                  <Users />
                </>
              )}
            </Badge>
            <Button
              className="size-6 rounded-sm"
              disabled
              size="icon"
              type="button"
              variant="outline"
            >
              <RefreshCw className="size-3" />
            </Button>
          </FormLabel>
          <FormControl className="animate-pulse">
            <div className="flex h-10 cursor-progress items-center justify-between rounded-md border px-3">
              <p className="text-muted-foreground text-sm">
                {channelType === "direct"
                  ? "Select a member"
                  : "Select channel members"}
              </p>
              <ChevronDown className="size-4" />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
