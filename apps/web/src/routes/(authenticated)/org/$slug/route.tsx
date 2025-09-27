import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(authenticated)/org/$slug")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
