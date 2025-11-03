import { authClient } from "@/lib/auth-client";

export const getActiveOrgSlug = async () => {
  const { data: session } = await authClient.getSession();

  if (!session) {
    return null;
  }

  const { data: orgs, error } = await authClient.organization.list();

  if (error || !orgs || orgs.length === 0) {
    return null;
  }

  if (session.session.activeOrganizationId) {
    const activeOrg = orgs.find(
      (org) => org.id === session.session.activeOrganizationId
    );

    if (activeOrg) {
      return activeOrg.slug;
    }
  }

  const orgSlug = orgs[0].slug;
  return orgSlug;
};

export const getStatusBadgeVariant = (status: string) => {
  if (status === "pending") {
    return "secondary";
  }
  if (status === "accepted") {
    return "default";
  }
  if (status === "rejected") {
    return "destructive";
  }
  return "secondary";
};

export const getRoleBadgeVariant = (role: string) => {
  if (role === "owner") {
    return "default";
  }
  if (role === "admin") {
    return "secondary";
  }
  if (role === "member") {
    return "outline";
  }
  return "outline";
};
