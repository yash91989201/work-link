import { createFileRoute } from "@tanstack/react-router";
import { CreateTeamForm } from "@/components/admin/team/create-team-form";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(admin)/dashboard/teams/new"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <CreateTeamForm />
    </div>
  );
}
