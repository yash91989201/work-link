import { redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export type UserRole = "owner" | "admin" | "member";

/**
 * Get the user's role in a specific organization by slug
 */
export async function getUserRoleInOrganization(orgSlug: string): Promise<UserRole | null> {
  try {
    const { data: orgs } = await authClient.organization.list();
    const org = orgs?.find(o => o.slug === orgSlug);
    // Access the role from organization membership data
    return (org as any)?.role as UserRole ?? null;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
}

/**
 * Check if user has the required role or higher in the role hierarchy
 */
export function hasRequiredRole(userRole: UserRole | null, requiredRole: UserRole): boolean {
  if (!userRole) return false;

  const roleHierarchy: Record<UserRole, number> = {
    member: 1,
    admin: 2,
    owner: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Get all roles that meet the minimum required role level
 */
export function getRoleHierarchy(minRole: UserRole): UserRole[] {
  const allRoles: UserRole[] = ["member", "admin", "owner"];
  const roleHierarchy: Record<UserRole, number> = {
    member: 1,
    admin: 2,
    owner: 3,
  };

  return allRoles.filter(role => roleHierarchy[role] >= roleHierarchy[minRole]);
}

/**
 * Require specific role for route access - throws redirect if insufficient permissions
 */
export async function requireRole(orgSlug: string, requiredRole: UserRole): Promise<UserRole> {
  const userRole = await getUserRoleInOrganization(orgSlug);

  if (!hasRequiredRole(userRole, requiredRole)) {
    // Redirect to organization index if insufficient permissions
    throw redirect({
      to: "/org/$slug" as any,
      params: { slug: orgSlug }
    });
  }

  return userRole as UserRole;
}

/**
 * Check if user is a member of the organization (any role)
 */
export async function requireOrganizationMember(orgSlug: string): Promise<UserRole> {
  const userRole = await getUserRoleInOrganization(orgSlug);

  if (!userRole) {
    // Redirect to organizations list if not a member
    throw redirect({
      to: "/org/new" as any
    });
  }

  return userRole;
}

