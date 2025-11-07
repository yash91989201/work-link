import type { MiddlewareHandler } from "hono";
import { Hono } from "hono";
import type { Context } from "@/context";
import { createContext } from "@/context";
import { prepareElectricUrl, proxyElectricRequest } from "@/lib/electric-proxy";

type ElectricEnv = {
  Variables: {
    context: Context;
  };
};

// Middleware to check authentication
const requireAuth: MiddlewareHandler<ElectricEnv> = async (c, next) => {
  const context = c.get("context");

  if (!context.session?.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
};

export const electricRouter = new Hono<ElectricEnv>();

// Inject context into all routes
electricRouter.use("*", async (c, next) => {
  const context = await createContext({ context: c });
  c.set("context", context);
  await next();
});

electricRouter.get("/shapes/messages", requireAuth, async (c) => {
  const originUrl = prepareElectricUrl(c.req.url);

  originUrl.searchParams.set("table", "message");

  const res = await proxyElectricRequest(originUrl);

  return res;
});

electricRouter.get("/shapes/users", requireAuth, (c) => {
  const context = c.get("context") as Context;
  const originUrl = prepareElectricUrl(c.req.url);

  originUrl.searchParams.set("table", "user");
  // Users can see all users in their organization (adjust as needed)
  // For now, we'll allow all users to be visible
  const filter = `organization_id = '${context.session?.session.activeOrganizationId}'`;
  originUrl.searchParams.set("where", filter);

  return proxyElectricRequest(originUrl);
});

electricRouter.get("/shapes/attachments", requireAuth, (c) => {
  const context = c.get("context") as Context;
  const originUrl = prepareElectricUrl(c.req.url);

  originUrl.searchParams.set("table", "attachment");
  // Filter attachments based on user access (adjust filter as needed)
  const filter = `user_id = '${context.session?.user.id}'`;
  originUrl.searchParams.set("where", filter);

  return proxyElectricRequest(originUrl);
});
