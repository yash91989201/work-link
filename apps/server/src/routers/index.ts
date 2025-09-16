import type { RouterClient } from "@orpc/server";
import { publicProcedure } from "@/lib/orpc";
import { organizationRotuer } from "./organization";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  organization: organizationRotuer,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
