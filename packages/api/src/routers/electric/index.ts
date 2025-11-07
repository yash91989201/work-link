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
  const originUrl = prepareElectricUrl(c.req.url);

  originUrl.searchParams.set("table", "user");

  return proxyElectricRequest(originUrl);
});

electricRouter.get("/shapes/attachments", requireAuth, (c) => {
  const originUrl = prepareElectricUrl(c.req.url);

  originUrl.searchParams.set("table", "attachment");

  return proxyElectricRequest(originUrl);
});

electricRouter.get("/shapes/accounts", requireAuth, (c) => {
  const context = c.get("context") as Context;
  const originUrl = prepareElectricUrl(c.req.url);

  originUrl.searchParams.set("table", "account");
  // Users can only see their own accounts
  const filter = `"userId" = '${context.session?.user.id}'`;
  originUrl.searchParams.set("where", filter);

  return proxyElectricRequest(originUrl);
});

electricRouter.get("/shapes/sessions", requireAuth, (c) => {
  const context = c.get("context") as Context;
  const originUrl = prepareElectricUrl(c.req.url);

  originUrl.searchParams.set("table", "session");
  // Users can only see their own sessions
  const filter = `"userId" = '${context.session?.user.id}'`;
  originUrl.searchParams.set("where", filter);

  return proxyElectricRequest(originUrl);
});

electricRouter.get("/shapes/invitations", requireAuth, (c) => {
  const context = c.get("context") as Context;
  const originUrl = prepareElectricUrl(c.req.url);

  originUrl.searchParams.set("table", "invitation");
  // Users can see invitations related to their organization
  const filter = `"organizationId" = '${context.session?.session.activeOrganizationId}'`;
  originUrl.searchParams.set("where", filter);

  return proxyElectricRequest(originUrl);
});

electricRouter.get("/shapes/members", requireAuth, (c) => {
  const context = c.get("context") as Context;
  const originUrl = prepareElectricUrl(c.req.url);

  originUrl.searchParams.set("table", "member");
  // Users can see all members in their organization
  const filter = `"organizationId" = '${context.session?.session.activeOrganizationId}'`;
  originUrl.searchParams.set("where", filter);

  return proxyElectricRequest(originUrl);
});

electricRouter.get("/shapes/organizations", requireAuth, (c) => {
  const context = c.get("context") as Context;
  const originUrl = prepareElectricUrl(c.req.url);

  originUrl.searchParams.set("table", "organization");
  // Users can see organizations they belong to
  const filter = `id IN (SELECT "organizationId" FROM member WHERE "userId" = '${context.session?.user.id}')`;
  originUrl.searchParams.set("where", filter);

  return proxyElectricRequest(originUrl);
});

electricRouter.get("/shapes/teams", requireAuth, (c) => {
  const context = c.get("context") as Context;
  const originUrl = prepareElectricUrl(c.req.url);

  originUrl.searchParams.set("table", "team");
  // Users can see teams in their organization
  const filter = `"organizationId" = '${context.session?.session.activeOrganizationId}'`;
  originUrl.searchParams.set("where", filter);

  return proxyElectricRequest(originUrl);
});

electricRouter.get("/shapes/team-members", requireAuth, (c) => {
  const context = c.get("context") as Context;
  const originUrl = prepareElectricUrl(c.req.url);

  originUrl.searchParams.set("table", "teamMember");
  // Users can see team members for teams in their organization
  const filter = `teamId IN (SELECT id FROM team WHERE "organizationId" = '${context.session?.session.activeOrganizationId}')`;
  originUrl.searchParams.set("where", filter);

  return proxyElectricRequest(originUrl);
});

electricRouter.get("/shapes/verifications", requireAuth, (c) => {
  const context = c.get("context") as Context;
  const originUrl = prepareElectricUrl(c.req.url);

  originUrl.searchParams.set("table", "verification");
  // Users can only see their own verifications
  const filter = `"userId" = '${context.session?.user.id}'`;
  originUrl.searchParams.set("where", filter);

  return proxyElectricRequest(originUrl);
});

electricRouter.get("/shapes/attendance", requireAuth, (c) => {
  const context = c.get("context") as Context;
  const originUrl = prepareElectricUrl(c.req.url);

  originUrl.searchParams.set("table", "attendance");
  // Users can see their own attendance and potentially attendance for their organization
  const filter = `"userId" = '${context.session?.user.id}' OR "organizationId" = '${context.session?.session.activeOrganizationId}'`;
  originUrl.searchParams.set("where", filter);

  return proxyElectricRequest(originUrl);
});

electricRouter.get("/shapes/channels", requireAuth, (c) => {
  const context = c.get("context") as Context;
  const originUrl = prepareElectricUrl(c.req.url);

  originUrl.searchParams.set("table", "channel");
  // Users can see channels in their organization
  const filter = `"organizationId" = '${context.session?.session.activeOrganizationId}'`;
  originUrl.searchParams.set("where", filter);

  return proxyElectricRequest(originUrl);
});

electricRouter.get("/shapes/channel-members", requireAuth, (c) => {
  const originUrl = prepareElectricUrl(c.req.url);

  originUrl.searchParams.set("table", '"channelMember"');

  return proxyElectricRequest(originUrl);
});

electricRouter.get("/shapes/notifications", requireAuth, (c) => {
  const context = c.get("context") as Context;
  const originUrl = prepareElectricUrl(c.req.url);

  originUrl.searchParams.set("table", "notification");
  // Users can only see their own notifications
  const filter = `"userId" = '${context.session?.user.id}'`;
  originUrl.searchParams.set("where", filter);

  return proxyElectricRequest(originUrl);
});

electricRouter.get("/shapes/message-read", requireAuth, (c) => {
  const context = c.get("context") as Context;
  const originUrl = prepareElectricUrl(c.req.url);

  originUrl.searchParams.set("table", "messageRead");
  // Users can only see their own message read status
  const filter = `"userId" = '${context.session?.user.id}'`;
  originUrl.searchParams.set("where", filter);

  return proxyElectricRequest(originUrl);
});

electricRouter.get("/shapes/channel-join-requests", requireAuth, (c) => {
  const originUrl = prepareElectricUrl(c.req.url);

  originUrl.searchParams.set("table", "channelJoinRequest");

  return proxyElectricRequest(originUrl);
});
