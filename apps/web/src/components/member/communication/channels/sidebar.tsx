import { ChannelList } from "./channel-list";
import { CreateChannelForm } from "./create-channel-form";

export const ChannelSidebar = () => {
  return (
    <div className="flex h-full w-64 flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="font-semibold">Channels</h2>
        <CreateChannelForm />
      </div>
      <ChannelList />
    </div>
  );
};
