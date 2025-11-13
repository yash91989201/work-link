import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RouteHeader } from "@/components/settings/route-header";
import { SettingsSidebar } from "@/components/settings/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const Route = createFileRoute("/(authenticated)/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SidebarProvider
      defaultOpen={true}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <SettingsSidebar variant="sidebar" />
      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <main className="@container/main flex flex-1 flex-col gap-2">
            <RouteHeader />
            <Outlet />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
