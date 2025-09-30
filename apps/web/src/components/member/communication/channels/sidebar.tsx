import { Hash, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChannelList } from "./channel-list";
import { CreateChannelForm } from "./create-channel-form";

export const ChannelSidebar = () => {
  return (
    <div className="flex h-full w-72 flex-col border-r bg-card">
      <div className="flex items-center justify-between border-b px-4 py-4">
        <div className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-lg">Channels</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button className="h-8 w-8" size="icon" variant="ghost">
            <Users className="h-4 w-4" />
          </Button>
          <CreateChannelForm />
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ChannelList />
      </div>

      <div className="border-t p-3">
        <Button className="w-full justify-start gap-2" variant="ghost">
          <Settings className="h-4 w-4" />
          <span>Channel Settings</span>
        </Button>
      </div>
    </div>
  );
};
