import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(member)/team/$id/module/$slug/feature/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      Hello
      "/(authenticated)/org/$slug/(member)/team/$slug/module/$slug/feature/"!
    </div>
  );
}
