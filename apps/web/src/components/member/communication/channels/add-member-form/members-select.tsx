import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronDown, RefreshCw } from "lucide-react";
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
import type { AddMemberFormType } from "@/lib/types";
import { cn } from "@/lib/utils";

export const AddMembersSelect = () => {
  const form = useFormContext<AddMemberFormType>();

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

  return (
    <FormField
      control={form.control}
      name="memberIds"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            <span className="flex flex-1 items-center gap-2">
              Select Members
            </span>
            <Badge className="ml-2" variant="secondary">
              1+
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
              onValueChange={field.onChange}
              options={memberOptions}
              placeholder="Select members to add to channel"
              value={field.value}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export function AddMembersSelectSkeleton() {
  return (
    <FormField
      control={useFormContext<AddMemberFormType>().control}
      name="memberIds"
      render={() => (
        <FormItem>
          <FormLabel>
            <span className="flex flex-1 items-center gap-2">
              Select Members
            </span>
            <Badge className="ml-2" variant="secondary">
              1+
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
                Select members to add to channel
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
