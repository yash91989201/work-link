import { Hash } from "lucide-react";
import { ChannelList } from "./channel-list";
import { CreateChannelForm } from "./create-channel-form";

export const ChannelSidebar = () => {
  return (
    <div className="flex h-full w-80 flex-col border-r bg-card">
      <div className="flex items-center justify-between border-b px-4 py-4">
        <div className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-lg">Channels</h2>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ChannelList />
      </div>

      <div className="border-t p-3">
        <CreateChannelForm />
      </div>
    </div>
  );
};
