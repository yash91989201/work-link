import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MIN_PASSWORD_LENGTH } from "@/constants";
import { authClient } from "@/lib/auth-client";

export default function SignInForm() {
  const navigate = useNavigate({
    from: "/",
  });
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            navigate({
              to: "/",
            });
            toast.success("Sign in successful");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        password: z
          .string()
          .min(MIN_PASSWORD_LENGTH, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="grid gap-2">
            <form.Field name="email">
              {(field) => (
                <>
                  <Label htmlFor={field.name}>Email</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="name@example.com"
                    type="email"
                    value={field.state.value}
                  />
                  {field.state.meta.touched &&
                    field.state.meta.errors.map((error) => (
                      <p className="text-sm text-red-500" key={error}>
                        {error}
                      </p>
                    ))}
                </>
              )}
            </form.Field>
          </div>
          <div className="grid gap-2">
            <form.Field name="password">
              {(field) => (
                <>
                  <Label htmlFor={field.name}>Password</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    type="password"
                    value={field.state.value}
                  />
                  {field.state.meta.touched &&
                    field.state.meta.errors.map((error) => (
                      <p className="text-sm text-red-500" key={error}>
                        {error}
                      </p>
                    ))}
                </>
              )}
            </form.Field>
          </div>
          <form.Subscribe>
            {(state) => (
              <Button
                className="w-full"
                disabled={!state.canSubmit || state.isSubmitting}
                type="submit"
              >
                {state.isSubmitting ? "Submitting..." : "Login"}
              </Button>
            )}
          </form.Subscribe>
        </form>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link className="underline" to="/sign-up">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}