import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
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
import { authClient } from "@/lib/auth-client";

export const TeamsDropdown = () => {
  const { slug } = useParams({
    from: "/(authenticated)/org/$slug",
  });

  const form = useFormContext();

  const { data: teams } = useSuspenseQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await authClient.organization.listTeams();

      if (error !== null) {
        return [];
      }

      return data;
    },
  });

  return (
    <FormField
      control={form.control}
      name="teamId"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="font-medium text-sm">Team</FormLabel>
          {teams.length > 0 ? (
            <Select defaultValue={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="space-y-2">
              <div className="flex h-11 w-full items-center justify-center rounded-md border border-input bg-background text-muted-foreground text-sm">
                No teams available
              </div>
              <Button asChild className="h-11 w-full" variant="outline">
                <Link params={{ slug }} to="/org/$slug/dashboard/teams">
                  Create Team
                </Link>
              </Button>
            </div>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
