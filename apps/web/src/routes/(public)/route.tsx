import {
  createFileRoute,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { FullScreenLoader } from "@/components/shared/full-screen-loader";
import { Header } from "@/components/shared/header";

export const Route = createFileRoute("/(public)")({
  pendingComponent: () => <FullScreenLoader />,
  component: RouteComponent,
});

function RouteComponent() {
  const isFetching = useRouterState({
    select: (s) => s.isLoading,
  });

  return (
    <div className="grid h-svh grid-rows-[auto_1fr]">
      <Header />
      {isFetching ? <FullScreenLoader /> : <Outlet />}
    </div>
  );
}
