# Simple Form Implementation Instructions

This document explains how to implement **simple forms** (single component forms) using **React Hook Form**, **Zod**, **standardSchemaResolver**, and **shadcn/ui**.

---

## 📂 Project Structure

- **Schemas** → `src/lib/schemas/`
- **Types** → `src/lib/types/` (inferred with `z.infer`)
- **Form Components** → co-located in feature folders

---

## 🧩 Schema & Types

- Define schemas in `src/lib/schemas/`.
- Always suffix with `FormSchema` (e.g., `LogInFormSchema`, `CreateFeedbackFormSchema`).
- Export inferred types in `src/lib/types` (auto-generated from schemas):

```ts
export type LogInFormType = z.infer<typeof LogInFormSchema>;
```

---

## 🛠 Setup with useForm

```ts
const form = useForm<LogInFormType>({
  resolver: standardSchemaResolver(LogInFormSchema),
  defaultValues: {
    email: "",
    password: "",
  },
});
```

Wrap with `<Form {...form}>`:

```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    {/* fields */}
  </form>
</Form>
```

---

## 🔄 Mutations & Submissions

- Always use `useMutation` with `queryUtils.*.mutationOptions()`.
- Handle side effects (`toast`, `invalidateQueries`, `navigate`) in `mutationOptions`.

---

## 🔒 UX Rules

1. **Buttons**
   - `<button>` defaults to `type="submit"`.
   - Use `type="button"` for non-submit actions.
   - Use `type="reset"` for reset actions.
   - Omit `type` when the button should submit the form.
2. **Validation** → always show `<FormMessage />`.
3. **Loading state** → disable submit button when submitting (`form.formState.isSubmitting || isPending`).
4. **Reset** → call `form.reset()` after successful submission if needed. Or create seperate function to handle reset and pass that to the <form></form> component's onReset.

---

## 📝 Boilerplate (Simple Form)

```tsx
"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ExampleFormSchema } from "@/lib/schemas/example";
import type { ExampleFormType } from "@/lib/types";
import { queryUtils } from "@/utils/orpc";

export function ExampleForm() {
  const { mutateAsync: createExample, isPending } = useMutation(
    queryUtils.example.create.mutationOptions({
      onSuccess: () => toast.success("Form submitted successfully"),
      onError: (err) => toast.error(err.message),
    })
  );

  const form = useForm<ExampleFormType>({
    resolver: standardSchemaResolver(ExampleFormSchema),
    defaultValues: { name: "", email: "" },
  });

  const onSubmit: SubmitHandler<ExampleFormType> = async (values) => {
    await createExample(values);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={isPending || form.formState.isSubmitting}>
          {isPending || form.formState.isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
}
```
