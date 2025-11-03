import { isUserAlreadyExistsError } from "@/lib/auth/utils";
import { authClient } from "@/lib/auth-client";
import type { AcceptInvitationFormType } from "@/lib/types";

interface AcceptedInvitation {
  member: {
    organizationId: string;
  };
}

export async function acceptInvitationAndActivate(
  params: AcceptInvitationFormType
) {
  await ensureAuthenticatedUser(params);

  const accepted = await acceptOrganizationInvitation(params.invitationId);
  const slug = await resolveAndActivateOrganization(
    accepted?.member.organizationId ?? null
  );

  return slug;
}

async function ensureAuthenticatedUser({
  email,
  password,
  name,
}: AcceptInvitationFormType) {
  const signUpResult = await authClient.signUp.email({
    email,
    password,
    name,
  });

  if (signUpResult.error === null) {
    return;
  }

  if (!isUserAlreadyExistsError(signUpResult.error)) {
    throw new Error(signUpResult.error.message ?? "Sign up failed");
  }

  const signInResult = await authClient.signIn.email({
    email,
    password,
  });

  if (signInResult.error !== null) {
    throw new Error(signInResult.error.message ?? "Unable to sign in");
  }
}

async function acceptOrganizationInvitation(invitationId: string) {
  const { data, error } = await authClient.organization.acceptInvitation({
    invitationId,
  });

  if (error !== null) {
    throw new Error(
      error.message ?? "Failed to accept the organization invitation"
    );
  }

  return data as AcceptedInvitation | null;
}

async function resolveAndActivateOrganization(organizationId: string | null) {
  const { data: organizations, error } = await authClient.organization.list();

  if (error !== null) {
    throw new Error(error.message ?? "Failed to load organization data");
  }

  const organization =
    (organizationId !== null
      ? organizations?.find((item) => item.id === organizationId)
      : undefined) ??
    organizations?.[0] ??
    null;

  if (organization) {
    await authClient.organization.setActive({
      organizationId: organization.id,
      organizationSlug: organization.slug,
    });

    return organization.slug;
  }

  return null;
}
