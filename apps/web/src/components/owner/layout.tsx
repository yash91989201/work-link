import { cn } from "@/lib/utils";

interface OwnerRootLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const OwnerRootLayout = ({
  children,
  className,
}: OwnerRootLayoutProps) => {
  return (
    <div className={cn("w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
};
