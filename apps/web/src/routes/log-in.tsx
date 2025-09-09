import { createFileRoute } from "@tanstack/react-router";
import SignInForm from "@/components/shared/sign-in-form";

export const Route = createFileRoute("/log-in")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto flex h-full w-full items-center justify-center">
      <SignInForm
        onSwitchToSignUp={() => {
          // signup
        }}
      />
    </div>
  );
}
