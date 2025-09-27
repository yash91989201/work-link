import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(admin)/dashboard/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>content</div>;
}
