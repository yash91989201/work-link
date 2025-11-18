import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    tanstackRouter({}),
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // ---------------------------
          // Core Framework
          // ---------------------------
          react: ["react", "react-dom"],

          // ---------------------------
          // TanStack Ecosystem
          // ---------------------------
          tanstack: [
            "@tanstack/react-query",
            "@tanstack/react-query-devtools",
            "@tanstack/react-router",
            "@tanstack/react-router-devtools",
            "@tanstack/react-table",
            "@tanstack/react-virtual",
            "@tanstack/react-form",
            "@tanstack/react-db",
          ],

          // ---------------------------
          // Radix UI (ALL COMPONENTS)
          // ---------------------------
          radix: [
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-aspect-ratio",
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-collapsible",
            "@radix-ui/react-context-menu",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-hover-card",
            "@radix-ui/react-label",
            "@radix-ui/react-menubar",
            "@radix-ui/react-navigation-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-progress",
            "@radix-ui/react-radio-group",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slider",
            "@radix-ui/react-slot",
            "@radix-ui/react-switch",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toggle",
            "@radix-ui/react-toggle-group",
            "@radix-ui/react-tooltip",
          ],

          // ---------------------------
          // ORPC
          // ---------------------------
          orpc: ["@orpc/client", "@orpc/server", "@orpc/tanstack-query"],

          // ---------------------------
          // Editor (TIPTAP)
          // ---------------------------
          tiptap: [
            "@tiptap/react",
            "@tiptap/starter-kit",
            "@tiptap/suggestion",
            "@tiptap/extension-image",
            "@tiptap/extension-mention",
            "@tiptap/extension-bubble-menu",
            "@tiptap/extension-placeholder",
            "@tiptap/extension-underline",
          ],

          // ---------------------------
          // UI / Utility Libraries
          // ---------------------------
          ui: [
            "class-variance-authority",
            "clsx",
            "tailwind-merge",
            "sonner",
            "lucide-react",
            "vaul",
            "embla-carousel-react",
            "react-resizable-panels",
            "cmdk",
            "next-themes",
            "input-otp",
            "frimousse",
            "tippy.js",
            "@uidotdev/usehooks",
          ],

          // ---------------------------
          // Forms & Validation
          // ---------------------------
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],

          // ---------------------------
          // Data Handling / Utils
          // ---------------------------
          utils: [
            "date-fns",
            "dompurify",
            "html-react-parser",
            "react-lazy-load-image-component",
            "react-dropzone",
          ],

          // ---------------------------
          // Charts
          // ---------------------------
          charts: ["recharts"],

          // ---------------------------
          // Auth
          // ---------------------------
          auth: ["better-auth"],

          // ---------------------------
          // Supabase
          // ---------------------------
          supabase: ["@supabase/supabase-js"],

          // ---------------------------
          // Electric SQL / Local-first DB
          // ---------------------------
          electric: ["@tanstack/electric-db-collection"],

          // ---------------------------
          // State Management
          // ---------------------------
          state: ["zustand"],

          // ---------------------------
          // Other functional deps
          // ---------------------------
          calendar: ["react-day-picker"],
        },
      },
    },
  },
});
