import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(admin)/dashboard/teams/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>dummy ui here</div>;
}
