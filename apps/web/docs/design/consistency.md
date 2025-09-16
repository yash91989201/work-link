# Design Consistency Guidelines

## 1. Purpose

- Ensure **all frontend UI components** follow the established **design system**.  
- Avoid random spacing, colors, border-radius, or font sizes.  
- Always refer to the **predefined theme setup**.

## 2. Theme Reference

- All **color variables, spacing, border-radius, font sizes, etc.** are defined in:  

```
src/styles/index.css
```

- Use **Tailwind classes** corresponding to these variables.  
- When using **shadcn/ui components**, only use the **theme tokens or primitive variables** defined in the project.  

## 3. Folder for Documentation

- Guidelines for design consistency are maintained in:  

```
docs/design/consistency.md
```

- Whenever creating new UI components or updating existing ones, **reference this document** to ensure alignment with the project theme.

## 4. Styling Rules

- **Colors:**  
  - Use only project-defined color variables or Tailwind classes derived from `src/index.css`.  
  - Do not invent new hex codes or Tailwind colors.  

- **Spacing & Padding:**  
  - Use project-defined spacing scale (e.g., `p-4`, `m-6`) corresponding to `src/index.css`.  
  - Avoid arbitrary pixel values.  

- **Border Radius / Rounded Corners:**  
  - Use predefined border-radius variables (e.g., `rounded`, `rounded-lg`) only.  

- **Typography:**  
  - Use font sizes and weights defined in the project theme.  

## 5. Component Usage

- When using **shadcn/ui components**, ensure that:  
  - Props respect the theme variables.  
  - Any custom styling should extend **existing tokens**, not override with arbitrary values.  
  - If required checkout the code for the component being used to understand existing props and styling.

## 6. Example (Correct vs Incorrect)

```ts
// ✅ Correct
<Button className="bg-primary text-white rounded-lg p-4">Click Me</Button>

// ❌ Incorrect
<Button style={{ backgroundColor: '#ff1234', padding: '11px', borderRadius: '7px' }}>Click Me</Button>
```

## 7. Summary

- **Always reference `src/index.css` and shadcn theme tokens.**
- **Avoid ad-hoc styles.**
- This ensures consistency, maintainability, and adherence to the project’s design system.
