import { ChevronDown, RefreshCw } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useListOrgTeams } from "@/hooks/use-list-org-teams";
import type { CreateChannelFormType } from "@/lib/types";
import { cn } from "@/lib/utils";

export const TeamSelect = () => {
  const form = useFormContext<CreateChannelFormType>();

  const { teams, refetchTeams, isRefetching } = useListOrgTeams();

  return (
    <FormField
      control={form.control}
      name="teamId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            <span className="flex-1">Teams</span>
            <Button
              className="size-6 rounded-sm"
              disabled={isRefetching}
              onClick={() => refetchTeams()}
              size="icon"
              type="button"
              variant="outline"
            >
              <RefreshCw
                className={cn("size-3", {
                  "animate-spin": isRefetching,
                })}
              />
            </Button>
          </FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export function TeamSelectSkeleton() {
  const form = useFormContext<CreateChannelFormType>();
  return (
    <FormField
      control={form.control}
      name="memberIds"
      render={() => (
        <FormItem>
          <FormLabel>
            <span className="flex-1">Teams</span>
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
              <p className="text-muted-foreground text-sm">Select a team</p>
              <ChevronDown className="size-4" />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
