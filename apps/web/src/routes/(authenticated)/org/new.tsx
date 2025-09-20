import { createFileRoute } from "@tanstack/react-router";
import { CreateOrgForm } from "@/components/org/new/create-org-form";

export const Route = createFileRoute("/(authenticated)/org/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="mx-auto my-6 max-w-lg">
      <CreateOrgForm />
    </main>
  );
}
