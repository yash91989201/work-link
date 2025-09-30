import { attachmentsRouter } from "@/routers/communication/attachments";
import { channelRouter } from "@/routers/communication/channel";
import { messagesRouter } from "@/routers/communication/messages";
import { notificationsRouter } from "@/routers/communication/notifications";

export const communicationRouter = {
  attachments: attachmentsRouter,
  channel: channelRouter,
  messages: messagesRouter,
  notifications: notificationsRouter,
};
