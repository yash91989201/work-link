import { protectedProcedure } from "@/index";
import { prepareElectricUrl, proxyElectricRequest } from "@/lib/electric-proxy";

export const electricRouter = {
  messages: protectedProcedure.handler(({ context: { headers } }) => {
    const originUrl = prepareElectricUrl(headers.get("x-request-url") || "");

    originUrl.searchParams.set("table", "message");

    return proxyElectricRequest(originUrl);
  }),

  users: protectedProcedure.handler(({ context: { session, headers } }) => {
    const originUrl = prepareElectricUrl(headers.get("x-request-url") || "");

    originUrl.searchParams.set("table", "user");
    // Users can see all users in their organization (adjust as needed)
    // For now, we'll allow all users to be visible
    const filter = `organization_id = '${session.session.activeOrganizationId}'`;
    originUrl.searchParams.set("where", filter);

    return proxyElectricRequest(originUrl);
  }),

  attachments: protectedProcedure.handler(
    ({ context: { session, headers } }) => {
      const originUrl = prepareElectricUrl(headers.get("x-request-url") || "");

      originUrl.searchParams.set("table", "attachment");
      // Filter attachments based on user access (adjust filter as needed)
      const filter = `user_id = '${session.user.id}'`;
      originUrl.searchParams.set("where", filter);

      return proxyElectricRequest(originUrl);
    }
  ),
};
