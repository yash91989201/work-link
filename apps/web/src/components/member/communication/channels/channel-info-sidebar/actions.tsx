import { Settings } from "lucide-react";
import { AddMemberForm } from "@/components/member/communication/channels/add-member-form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Actions = ({ channelId }: { channelId: string }) => (
  <Accordion collapsible defaultValue="actions" type="single">
    <AccordionItem value="actions">
      <AccordionTrigger className="px-0 hover:no-underline">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-medium text-foreground text-sm">Actions</h4>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-0">
        <div className="space-y-2">
          <AddMemberForm channelId={channelId} />
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);
