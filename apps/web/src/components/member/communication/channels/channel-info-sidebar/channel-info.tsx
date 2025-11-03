import { Info } from "lucide-react";

export const ChannelInfo = ({
  createdByName,
  createdAt,
  channelDescription,
}: {
  channelDescription: string;
  createdByName: string;
  createdAt: Date;
}) => (
  <div>
    <div className="mb-3 flex items-center gap-2">
      <Info className="h-4 w-4 text-muted-foreground" />
      <h4 className="font-medium text-foreground text-sm">Channel Details</h4>
    </div>
    <div className="space-y-3 text-sm">
      <p className="text-muted-foreground text-sm leading-relaxed">
        {channelDescription}
      </p>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Created by</span>
        <span className="font-medium text-foreground">{createdByName}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Created On</span>
        <span className="font-medium text-foreground">
          {createdAt.toLocaleDateString()}
        </span>
      </div>
    </div>
  </div>
);
