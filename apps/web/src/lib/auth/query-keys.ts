/**
 * Centralized query key builder for auth client operations
 * Provides type-safe and consistent query keys for React Query
 */

export const getAuthQueryKey = {
  // Organization-related query keys
  organization: {
    // List all organizations for current user
    list: () => ["auth", "organization", "list"] as const,

    // Get specific organization by ID
    byId: (organizationId: string) =>
      ["auth", "organization", "byId", organizationId] as const,

    // List invitations for an organization
    invitations: (organizationId: string) =>
      ["auth", "organization", "invitations", organizationId] as const,

    // List members of an organization
    members: (organizationId: string) =>
      ["auth", "organization", "members", organizationId] as const,

    // Get organization roles
    roles: () => ["auth", "organization", "roles"] as const,

    // Get user's role in organization
    userRole: () => ["auth", "organization", "userRole"] as const,

    // Get active organization
    active: () => ["auth", "organization", "active"] as const,
  },

  // User-related query keys
  user: {
    // Current user session
    session: () => ["auth", "user", "session"] as const,

    // active org member role for user
    activeMemberRole: () => ["auth", "user", "active-member-role"] as const,

    // User profile
    profile: () => ["auth", "user", "profile"] as const,

    // User by ID
    byId: (userId: string) => ["auth", "user", "byId", userId] as const,

    // User organizations
    organizations: (userId: string) =>
      ["auth", "user", "organizations", userId] as const,
  },

  // Session-related query keys
  session: {
    // Current session
    current: () => ["auth", "session", "current"] as const,

    // Session list for user
    list: (userId: string) => ["auth", "session", "list", userId] as const,
  },

  // Invitation-related query keys (standalone)
  invitation: {
    // Get invitation by token
    byToken: (token: string) =>
      ["auth", "invitation", "byToken", token] as const,

    // List invitations for current user
    list: () => ["auth", "invitation", "list"] as const,
  },

  // Admin-specific query keys
  admin: {
    // All users (admin view)
    users: () => ["auth", "admin", "users"] as const,

    // All organizations (admin view)
    organizations: () => ["auth", "admin", "organizations"] as const,

    // System stats
    stats: () => ["auth", "admin", "stats"] as const,
  },

  // Utility functions for invalidation patterns
  invalidation: {
    // All auth queries
    all: () => ["auth"] as const,

    // All organization queries
    allOrganizations: () => ["auth", "organization"] as const,

    // Specific organization and all its related queries
    organization: (organizationId: string) =>
      ["auth", "organization", organizationId] as const,

    // All user queries
    allUsers: () => ["auth", "user"] as const,

    // All session queries
    allSessions: () => ["auth", "session"] as const,
  },
} as const;

// Helper function to check if a query key is an auth query
export const isAuthQueryKey = (queryKey: unknown[]): boolean => {
  return Array.isArray(queryKey) && queryKey[0] === "auth";
};

// Helper to get organization-specific query keys for bulk operations
export const getOrganizationQueryKeys = (organizationId: string) => ({
  invitations: getAuthQueryKey.organization.invitations(organizationId),
  members: getAuthQueryKey.organization.members(organizationId),
  roles: getAuthQueryKey.organization.roles(),
  details: getAuthQueryKey.organization.byId(organizationId),
});
