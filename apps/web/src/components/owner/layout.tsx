import { cn } from "@/lib/utils";
import { OwnerHeader } from "./header";

interface OwnerRootLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const OwnerRootLayout = ({
  children,
  className,
}: OwnerRootLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <OwnerHeader organizationName="Acme Corp" organizationSlug="acme-corp" />
      <main className={cn("container mx-auto", className)}>{children}</main>
    </div>
  );
};
