import { redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export type UserRole = "owner" | "admin" | "member";

export function hasRequiredRole(
  userRole: UserRole | null,
  requiredRole: UserRole
): boolean {
  if (!userRole) return false;

  const roleHierarchy: Record<UserRole, number> = {
    member: 1,
    admin: 2,
    owner: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function getRoleHierarchy(minRole: UserRole): UserRole[] {
  const allRoles: UserRole[] = ["member", "admin", "owner"];
  const roleHierarchy: Record<UserRole, number> = {
    member: 1,
    admin: 2,
    owner: 3,
  };

  return allRoles.filter(
    (role) => roleHierarchy[role] >= roleHierarchy[minRole]
  );
}

export async function requireRole(
  orgSlug: string,
  requiredRole: UserRole
): Promise<UserRole> {
  const { data, error } = await authClient.organization.getActiveMemberRole();

  if (error !== null) {
    throw redirect({
      to: "/login",
    });
  }

  const userRole = data.role as UserRole;
  if (!hasRequiredRole(userRole, requiredRole)) {
    throw redirect({
      to: "/org/$slug",
      params: { slug: orgSlug },
    });
  }

  return userRole as UserRole;
}

export async function requireOrganizationMember(): Promise<UserRole> {
  const { data, error } = await authClient.organization.getActiveMemberRole();

  if (error !== null) {
    throw redirect({
      to: "/login",
    });
  }

  const userRole = data.role as UserRole;

  if (!userRole) {
    // Redirect to organizations list if not a member
    throw redirect({
      to: "/org/new",
    });
  }

  return userRole;
}
