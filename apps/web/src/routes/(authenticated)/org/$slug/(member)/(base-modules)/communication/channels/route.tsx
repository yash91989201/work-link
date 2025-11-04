import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(member)/(base-modules)/communication/channels"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-screen gap-0 bg-background">
      <div className="flex min-h-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
