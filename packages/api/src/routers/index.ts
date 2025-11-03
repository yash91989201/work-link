import type { RouterClient } from "@orpc/server";
import { publicProcedure } from "@/index";
import { adminRouter } from "@/routers/admin";
import { communicationRouter } from "@/routers/communication";
import { memberRouter } from "@/routers/member";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => "OK"),
  member: memberRouter,
  communication: communicationRouter,
  admin: adminRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
