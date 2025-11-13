import { IconInnerShadowTop } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Image } from "@/components/shared/image";
import { getUserOrgLink } from "@/components/shared/my-org-button";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveMemberRole } from "@/hooks/use-active-member-role";
import { useActiveOrganization } from "@/hooks/use-active-organization";

export const OrgMenuButton = () => {
  const role = useActiveMemberRole();
  const activeOrganization = useActiveOrganization();

  if (activeOrganization === null || role === undefined) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          className="data-[slot=sidebar-menu-button]:p-1.5!"
        >
          <Link to="/">
            <IconInnerShadowTop className="size-5!" />
            <span className="font-semibold text-base">Acme Inc.</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  const logo = activeOrganization.logo ?? "/logo.webp";
  const to = getUserOrgLink(role);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip={activeOrganization.name}>
        <Link params={{ slug: activeOrganization.slug }} to={to}>
          <Image
            alt={activeOrganization.name}
            className="rounded-sm"
            height={24}
            src={logo}
            width={24}
          />
          <span className="font-semibold text-base group-data-[collapsible=icon]:hidden">
            {activeOrganization.name}
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export const OrgMenuButtonSkeleton = () => (
  <SidebarMenuItem>
    <SidebarMenuButton disabled>
      <Skeleton className="size-8" />
      <Skeleton className="h-8 w-full" />
    </SidebarMenuButton>
  </SidebarMenuItem>
);
