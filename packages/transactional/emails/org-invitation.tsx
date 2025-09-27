/** @jsxImportSource react */

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import { brandColors, emailTailwindConfig } from "@/_lib/theme";

type EmailProps = {
  email: string;
  invitedBy: string;
  invitationLink: string;
  role: string;
  organizationName: string;
};

const OrgInvitationEmail = ({
  email,
  invitedBy,
  invitationLink,
  role,
  organizationName,
}: EmailProps) => {
  const previewText = `Join ${organizationName} on Work Link today.`;

  return (
    <Tailwind config={emailTailwindConfig}>
      <Html>
        <Head />
        <Preview>{previewText}</Preview>
        <Body className="bg-background py-12">
          <Container className="mx-auto max-w-2xl overflow-hidden rounded-xl bg-card shadow-lg">
            <Section className="border-border border-b bg-secondary px-8 py-6 text-center text-secondary-foreground">
              <Img
                alt="Work Link logo"
                className="mx-auto"
                height={120}
                src="/static/work-link.webp"
                width={120}
              />
              <Text className="mt-4 font-semibold text-lg text-secondary-foreground uppercase tracking-wide">
                Work Link
              </Text>
              <Text className="mt-2 text-secondary-foreground text-sm">
                Collaboration that feels effortless.
              </Text>
            </Section>

            <Section className="px-8 py-10">
              <Heading className="mb-3 text-left font-semibold text-3xl text-foreground">
                Welcome to {organizationName}
              </Heading>

              <Text className="mb-4 text-base text-foreground leading-relaxed">
                Hello,
              </Text>

              <Text className="mb-6 text-base text-foreground leading-relaxed">
                <strong>{invitedBy}</strong> has invited you to partner with
                <strong> {organizationName}</strong> on Work Link as a
                <strong> {role}</strong>. Accept the invitation to access shared
                work, resources, and streamlined communication in one secure
                workspace.
              </Text>

              <Section className="mb-8 rounded-lg border border-border bg-muted px-6 py-5">
                <Text className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                  Invitation details
                </Text>
                <Text className="mt-3 text-foreground text-sm">
                  <strong>Organization:</strong> {organizationName}
                </Text>
                <Text className="mt-2 text-foreground text-sm">
                  <strong>Role:</strong> {role}
                </Text>
                <Text className="mt-2 text-foreground text-sm">
                  <strong>Invited by:</strong> {invitedBy}
                </Text>
              </Section>

              <Text className="mb-6 text-base text-foreground leading-relaxed">
                With Work Link you can:
              </Text>

              <Section className="mb-8">
                <ul className="list-disc pl-5 text-base text-foreground leading-relaxed">
                  <li>Stay aligned with real-time project visibility.</li>
                  <li className="mt-2">
                    Collaborate securely across teams and partners.
                  </li>
                  <li className="mt-2">
                    Automate updates and keep work moving forward.
                  </li>
                </ul>
              </Section>

              <Text className="mb-8 text-base text-foreground leading-relaxed">
                Click below to activate your account in less than a minute.
              </Text>

              <Button
                className="rounded-lg bg-primary px-7 py-3 font-semibold text-primary-foreground"
                href={invitationLink}
                style={{
                  background: brandColors.primary,
                  color: brandColors.primaryForeground,
                  padding: "14px 28px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  display: "inline-block",
                  fontWeight: "600",
                }}
              >
                Accept Invitation
              </Button>

              <Text className="mt-8 mb-4 text-muted-foreground text-sm">
                Or copy and paste this link into your browser:
              </Text>

              <Link
                className="break-all text-primary text-sm"
                href={invitationLink}
                style={{ color: brandColors.primary, wordBreak: "break-all" }}
              >
                {invitationLink}
              </Link>
            </Section>

            <Section className="border-border border-t bg-muted px-8 py-6">
              <Text className="text-center text-muted-foreground text-sm">
                Need a hand? Reply directly to this email and our team will be
                happy to assist.
              </Text>

              <Text className="mt-4 text-center text-muted-foreground text-sm">
                This invitation was sent to <strong>{email}</strong>. If you did
                not request access, you can safely ignore this message.
              </Text>

              <Text className="mt-6 text-center text-muted-foreground text-xs uppercase tracking-wide">
                © 2024 Work Link. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
};

export default OrgInvitationEmail;
