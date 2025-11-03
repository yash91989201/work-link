import { createFileRoute, Link } from "@tanstack/react-router";
import { LogInForm } from "@/components/user/login-form";

export const Route = createFileRoute("/(auth)/login")({
  component: LogInPage,
});

function LogInPage() {
  return (
    <div className="container relative grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center font-medium text-lg">
          Work Link
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;This library has saved me countless hours of work and
              helped me deliver stunning designs to my clients faster than ever
              before.&rdquo;
            </p>
            <footer className="text-sm">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="font-semibold text-2xl tracking-tight">
              Log in to your account
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter your email below to log in
            </p>
          </div>
          <LogInForm />
          <p className="px-8 text-center text-muted-foreground text-sm">
            Don't have an account?{" "}
            <Link
              className="underline underline-offset-4 hover:text-primary"
              to="/signup"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
