import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CommunicationRootLayout } from "@/components/member/communication/layout";

export const Route = createFileRoute(
  "/(authenticated)/org/$slug/(member)/(base-modules)/communication"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <CommunicationRootLayout>
      <Outlet />
    </CommunicationRootLayout>
  );
}
