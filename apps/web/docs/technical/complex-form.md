# Complex / Nested Form Implementation Instructions

This document explains how to implement **nested or multi-section forms** using **React Hook Form**, **Zod**, **standardSchemaResolver**, and **shadcn/ui**.

---

## 📂 Project Structure

- **Schemas** → `src/lib/schemas/`
- **Types** → `src/lib/types/` (inferred with `z.infer`)
- **Subcomponents** → each section in its own file (e.g., `ExamDetailsCard`, `ExamQuestionsSection`).

---

## 🧩 Schema & Types

- Define schemas in `src/lib/schemas/`.
- Always suffix with `FormSchema` (e.g., `CreateExamFormSchema`).
- Export inferred types in `src/lib/types` (auto-generated from schemas):

```ts
export type CreateExamFormSchemaType = z.infer<typeof CreateExamFormSchema>;
```

---

## 🛠 Setup with useForm & useFormContext

At the root:

```ts
const form = useForm<CreateExamFormSchemaType>({
  resolver: standardSchemaResolver(CreateExamFormSchema),
  defaultValues: { certification: "", questions: [] },
});
```

In subcomponents:

```ts
const form = useFormContext<CreateExamFormSchemaType>();
```

---

## 🧱 Dynamic Fields (useFieldArray)

- Use `useFieldArray` for lists (e.g., questions, options).
- Always handle ordering when adding/removing.

---

## 🔄 Mutations & Submissions

- Use `useMutation(queryUtils.*.mutationOptions())`.
- Transform form data in `onSubmit` if necessary (e.g., generating IDs, aggregating totals).

---

## 🔒 UX Rules

1. **Buttons**
   - Default is submit → omit `type` when intended for form submission.
   - Use `type="button"` for add/remove actions.
   - Use `type="reset"` for resets.
2. **Subcomponents** → must consume context via `useFormContext`.
3. **Cards** → use `<Card>` to structure large sections.
4. **Validation & Messages** → always use `<FormMessage />` under each field.

---

## 📝 Boilerplate (Complex Form)

```tsx
"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation } from "@tanstack/react-query";
import { type SubmitHandler, useForm, useFormContext, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ExampleNestedFormSchema } from "@/lib/schemas/example-nested";
import type { ExampleNestedFormType } from "@/lib/types";
import { queryUtils } from "@/utils/orpc";

export function ExampleNestedForm() {
  const form = useForm<ExampleNestedFormType>({
    resolver: standardSchemaResolver(ExampleNestedFormSchema),
    defaultValues: { title: "", items: [{ name: "", quantity: 1 }] },
  });

  const { mutateAsync: createExample } = useMutation(
    queryUtils.example.createNested.mutationOptions({
      onSuccess: () => toast.success("Form submitted successfully"),
      onError: (err) => toast.error(err.message),
    })
  );

  const onSubmit: SubmitHandler<ExampleNestedFormType> = async (values) => {
    await createExample(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <ItemsSection />
        <Button>Submit</Button>
      </form>
    </Form>
  );
}

function ItemsSection() {
  const form = useFormContext<ExampleNestedFormType>();
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  return (
    <Card className="p-4 space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-4 items-end">
          <FormField
            control={form.control}
            name={`items.${index}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter item name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`items.${index}.quantity`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="button" variant="destructive" onClick={() => remove(index)}>
            Remove
          </Button>
        </div>
      ))}
      <Button type="button" onClick={() => append({ name: "", quantity: 1 })}>
        Add Item
      </Button>
    </Card>
  );
}
```
