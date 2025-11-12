import { createORPCClient } from "@orpc/client";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from "@tanstack/react-router";
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
  beforeLoad: async () => {
    const session = await authClient.getSession();

    return {
      session: session.data,
    };
  },
  loader: async () => {
    const { data } = await authClient.organization.getFullOrganization();

    return {
      orgLogo: data?.logo ?? undefined,
      orgName: data?.name ?? undefined,
    };
  },
  head: ({ loaderData }) => {
    const orgName = loaderData?.orgName ?? "Work Link";
    const faviconLink =
      loaderData?.orgLogo === undefined
        ? {
            rel: "icon",
            href: "/favicon.ico",
          }
        : {
            rel: "icon",
            href: loaderData.orgLogo,
          };

    return {
      meta: [
        {
          title: orgName,
        },
        {
          name: "description",
          content:
            "Work Link is a lightweight, white-label team collaboration platform with secure channels, user management, and real-time communication tools.",
        },
      ],
      links: [
        faviconLink,
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=Open+Sans:wght@300;400;600;700&family=Lato:wght@300;400;700&family=Poppins:wght@300;400;500;600;700&family=Nunito:wght@300;400;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=Work+Sans:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap",
        },
      ],
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
    </>
  );
}
