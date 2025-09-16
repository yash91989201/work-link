# Loading State Guidelines

All components that fetch data using `useSuspenseQuery` hook from tanstack query **must implement a loading state**.

For example, if you have a table component named `UsersTable` that fetches data
using the `useSuspenseQuery` hook, it should display a
**content-accurate loading state** while data is being retrieved.

To achieve this, each data-fetching component should
have a corresponding **skeleton component**.  

In this example, the `UsersTable` will have a `UsersTableSkeleton` that is used
as a `fallback` within a Suspense boundary.

---

## Skeleton Components

A **skeleton component** should closely mimic the structure and layout of the
real component, but with placeholder elements.

- Use [shadcn/ui Skeleton](https://ui.shadcn.com/docs/components/skeleton)
for placeholders that represent data being loaded from an API.

- For non-dynamic content, use static placeholders where appropriate.

This approach ensures users immediately understand what type of data is being
loaded and reduces layout shift once the content appears.

---

## Example

```tsx
export const UsersTable = () => {
  const {data:users} = useSuspenseQuery(fetchUsers);

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export const UsersTableSkeleton = () => {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 5 }).map((_, index) => (
          <tr key={index}>
            <td>
              <Skeleton className="h-4 w-32" />
            </td>
            <td>
              <Skeleton className="h-4 w-48" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

---

## Implementation Strategy

1. **Create a skeleton component** for every data-fetching component.
   - Name it consistently: `<ComponentName>Skeleton`.
   - Place the skeleton component in the same file at the bottom.

2. **Match structure**
   - Ensure the skeleton matches the final component’s layout
      (table, cards, lists, etc.).

3. **Use placeholders intentionally**
   - Dynamic data → use `Skeleton` components.
   - Static data (e.g., table headers, labels) → render directly.

4. **Integrate with Suspense**
   - Wrap your component with a Suspense boundary and
     use the skeleton as the fallback:  

     ```tsx
     <Suspense fallback={<UsersTableSkeleton />}>
       <UsersTable />
     </Suspense>
     ```

---

## Skeleton Loader Requirements

- Must be **content-accurate** (structure should match the final UI).
- Should **avoid excessive animation**—keep it subtle.
