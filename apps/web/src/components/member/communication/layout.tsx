import { ChannelSidebar } from "./channels/sidebar";

export const CommunicationRootLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex h-screen gap-0 bg-background">
      <ChannelSidebar />
      <div className="flex min-h-0 flex-1">{children}</div>
    </div>
  );
};
