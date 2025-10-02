import { Phone, Settings, Video } from "lucide-react";
import { AddMemberForm } from "@/components/member/communication/channels/add-member-form";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Actions = ({ channelId }: { channelId: string }) => {
  return (
    <Accordion type="single" collapsible defaultValue="actions">
      <AccordionItem value="actions">
        <AccordionTrigger className="px-0 hover:no-underline">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium text-foreground text-sm">Actions</h4>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-0">
          <div className="space-y-2">
            <Button className="w-full justify-start" size="sm" variant="outline">
              <Phone className="mr-2 h-4 w-4" />
              Start Voice Call
            </Button>
            <Button className="w-full justify-start" size="sm" variant="outline">
              <Video className="mr-2 h-4 w-4" />
              Start Video Call
            </Button>
            <AddMemberForm channelId={channelId} />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
