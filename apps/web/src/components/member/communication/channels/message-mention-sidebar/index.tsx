import { AtSign, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { MessageWithParent } from "@/stores/message-list-store";
import {
  useMessageList,
  useMessageListActions,
} from "@/stores/message-list-store";
import { formatMessageDate } from "@/utils/message-utils";
import { MessageItem } from "../message-list/message-item";

export function MessageMentionSidebar({ channelId }: { channelId: string }) {
  const {
    isMentionSidebarOpen,
    mentionMessage,
    shouldPlayMentionSound,
  } = useMessageList(channelId);

  const { closeMentionSidebar, acknowledgeMentionSound } =
    useMessageListActions();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (shouldPlayMentionSound && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Silently handle autoplay restrictions
      });
      acknowledgeMentionSound();
    }
  }, [shouldPlayMentionSound, acknowledgeMentionSound]);

  useEffect(() => {
    if (isMentionSidebarOpen && !mentionMessage) {
      closeMentionSidebar();
    }
  }, [isMentionSidebarOpen, mentionMessage, closeMentionSidebar]);

  useEffect(() => {
    if (!isMentionSidebarOpen) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    container.scrollTop = 0;
  }, [isMentionSidebarOpen]);

  const hasMentionMessage = mentionMessage !== null;

  const shouldRenderContent = isMentionSidebarOpen || hasMentionMessage;

  return (
    <>
      {/** biome-ignore lint/a11y/useMediaCaption: <Audio notification does not require captions> */}
      <audio
        ref={audioRef}
        src="/assets/sounds/mention.webm"
        preload="auto"
      />
      <div
        aria-hidden={!isMentionSidebarOpen}
        className={cn(
          "flex h-full min-w-0 shrink-0 flex-col overflow-hidden bg-background/95 backdrop-blur-sm transition-[width,opacity] duration-300 ease-in-out supports-backdrop-filter:bg-background/60",
          isMentionSidebarOpen
            ? "w-full max-w-full border-l opacity-100 shadow-lg sm:w-[640px]"
            : "w-0 max-w-0 opacity-0"
        )}
        data-testid="message-mention-sidebar"
      >
        {shouldRenderContent && (
          <div className="flex h-full flex-1 flex-col">
            <div className="flex items-start justify-between border-b bg-muted/30 px-4 py-3">
              <div className="flex gap-3 space-y-1.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                  <AtSign className="h-5 w-5 text-primary" />
                </div>
                {hasMentionMessage ? (
                  <div className="flex flex-col gap-1.5">
                    <div className="font-semibold text-base">
                      You were mentioned
                    </div>
                    <div className="text-muted-foreground text-xs">
                      by {mentionMessage?.sender.name}
                    </div>
                    <div className="font-medium text-primary text-xs">
                      {mentionMessage?.createdAt
                        ? formatMessageDate(mentionMessage.createdAt)
                        : null}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No mention to display.
                  </p>
                )}
              </div>
              <button
                aria-label="Close mention"
                className="rounded-lg p-1.5 opacity-70 ring-offset-background transition-all hover:bg-destructive/10 hover:text-destructive hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                onClick={closeMentionSidebar}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              className="flex-1 space-y-3 overflow-y-auto px-1.5 py-3"
              ref={scrollContainerRef}
            >
              {hasMentionMessage ? (
                <MentionMessageItem message={mentionMessage} />
              ) : (
                <div className="flex h-full items-center justify-center px-4 text-center text-muted-foreground text-sm">
                  No mention to display.
                </div>
              )}
            </div>

            <div className="border-t px-4 py-3 text-center text-muted-foreground text-xs">
              Close this panel to continue.
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function MentionMessageItem({ message }: { message: MessageWithParent }) {
  return (
    <MessageItem
      message={message}
      showParentPreview={false}
      showThreadSummary={false}
    />
  );
}
