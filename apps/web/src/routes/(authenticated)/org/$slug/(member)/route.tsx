import { createFileRoute, Outlet } from "@tanstack/react-router";
import { MemberRootLayout } from "@/components/member/layout";

export const Route = createFileRoute("/(authenticated)/org/$slug/(member)")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <MemberRootLayout>
      <Outlet />
    </MemberRootLayout>
  );
}
