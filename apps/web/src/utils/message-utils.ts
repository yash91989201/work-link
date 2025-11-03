import type { MessageType } from "@work-link/db/lib/types";
import { format, formatDistanceToNow } from "date-fns";

export function formatMessageDate(date: Date): string {
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return formatDistanceToNow(date, { addSuffix: true });
  }
  return format(date, "MMM d, yyyy HH:mm");
}

export function shouldShowAvatar(
  message: MessageType,
  prevMessage?: MessageType
): boolean {
  if (!prevMessage) return true;
  if (prevMessage.senderId !== message.senderId) return true;

  const timeDiff =
    message.createdAt.getTime() - prevMessage.createdAt.getTime();
  return timeDiff > 5 * 60 * 1000; // 5 minutes
}

export function groupMessagesByDate(messages: MessageType[]) {
  const grouped = new Map<string, MessageType[]>();

  for (const message of messages) {
    const dateKey = format(message.createdAt, "yyyy-MM-dd");
    const existing = grouped.get(dateKey) || [];
    grouped.set(dateKey, [...existing, message]);
  }

  return Array.from(grouped.entries()).map(([date, msgs]) => ({
    date,
    messages: msgs,
  }));
}

export function isOwnMessage(message: MessageType, userId: string): boolean {
  return message.senderId === userId;
}
