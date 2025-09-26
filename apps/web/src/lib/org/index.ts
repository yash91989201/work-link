import { authClient } from "@/lib/auth-client";

export const getActiveOrgSlug = async () => {
  try {
    const { data: session } = await authClient.getSession();

    if (!session) {
      return;
    }

    const { data: orgs, error } = await authClient.organization.list();

    if (error || !orgs || orgs.length === 0) {
      return;
    }

    // If session has activeOrganizationId, try to find that org first
    if (session.session.activeOrganizationId) {
      const activeOrg = orgs.find(
        (org) => org.id === session.session.activeOrganizationId
      );
      if (activeOrg) {
        return activeOrg.slug;
      }
    }

    // Fall back to first organization
    return orgs[0].slug;
  } catch (error) {
    console.error("Error getting active org slug:", error);
    return;
  }
};
