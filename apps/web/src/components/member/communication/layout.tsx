import { ChannelSidebar } from "@/components/member/communication/channels/sidebar";

export const CommunicationRootLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex gap-1.5">
      <ChannelSidebar />
      {children}
    </div>
  );
};
