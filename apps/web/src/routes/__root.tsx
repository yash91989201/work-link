import { createORPCClient } from "@orpc/client";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { AppRouterClient } from "@work-link/api/routers/index";
import { useState } from "react";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { orpcClient, queryUtils } from "@/utils/orpc";
import { link } from "@/utils/orpc";
import "@/styles/index.css";
import "react-lazy-load-image-component/src/effects/blur.css";
import { FullScreenLoader } from "@/components/shared/full-screen-loader";
import { authClient } from "@/lib/auth-client";

export interface RouterAppContext {
  queryUtils: typeof queryUtils;
  queryClient: QueryClient;
  orpcClient: typeof orpcClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        title: "Work Link",
      },
      {
        name: "description",
        content:
          "Work Link is a lightweight, white-label team collaboration platform with secure channels, user management, and real-time communication tools.",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
  beforeLoad: async () => {
    const session = await authClient.getSession();

    return {
      session: session.data,
    };
  },
  pendingComponent: () => <FullScreenLoader />,
  component: RootComponent,
});

function RootComponent() {
  const [client] = useState<AppRouterClient>(() => createORPCClient(link));
  const [_orpcUtils] = useState(() => createTanstackQueryUtils(client));

  return (
    <>
      <HeadContent />
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
        <Outlet />
        <Toaster richColors />
      </ThemeProvider>
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools buttonPosition="bottom-right" position="bottom" />
    </>
  );
}
