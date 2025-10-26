import { IconInnerShadowTop } from "@tabler/icons-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Image } from "@/components/shared/image";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveOrganization } from "@/hooks/use-active-organization";

export const OrgMenuButton = () => {
  const activeOrganization = useActiveOrganization();
  const navigate = useNavigate();

  if (activeOrganization === null) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          className="data-[slot=sidebar-menu-button]:!p-1.5"
        >
          <Link to="/">
            <IconInnerShadowTop className="!size-5" />
            <span className="font-semibold text-base">Acme Inc.</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  const logo = activeOrganization.logo ?? "/logo.webp";

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className="data-[slot=sidebar-menu-button]:!p-1.5 min-w-8"
        onClick={() => {
          navigate({
            to: "/org/$slug",
            params: { slug: activeOrganization.slug },
          });
        }}
        tooltip={activeOrganization.name}
      >
        <Image
          alt={activeOrganization.name}
          className="rounded-sm"
          height={24}
          src={logo}
          width={24}
        />
        <span className="font-semibold text-base">
          {activeOrganization.name}
        </span>
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
