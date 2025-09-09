import type { RouterClient } from "@orpc/server";
import { publicProcedure } from "../lib/orpc";
import { organizationRouter } from "./organization";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  organization: organizationRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
