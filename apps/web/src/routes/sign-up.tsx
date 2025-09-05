import { createFileRoute } from "@tanstack/react-router";
import SignUpForm from "@/components/sign-up-form";

export const Route = createFileRoute("/sign-up")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <section className="container mx-auto flex h-full w-full items-center justify-center">
      <SignUpForm />
    </section>
  );
}
