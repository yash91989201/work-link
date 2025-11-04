import { createFileRoute, Outlet } from "@tanstack/react-router";
import { MemberSidebar } from "@/components/member/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const Route = createFileRoute("/(authenticated)/org/$slug/(member)")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SidebarProvider
      defaultOpen={false}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <MemberSidebar variant="sidebar" />
      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <main className="@container/main flex flex-1 flex-col gap-2">
            <Outlet />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
