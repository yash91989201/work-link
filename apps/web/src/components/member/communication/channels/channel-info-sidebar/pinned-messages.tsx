import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { Loader, Pin, PinOff, Search, SearchX, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePinnedMessagesRealtime } from "@/hooks/communications/use-pinned-messages";
import { cn } from "@/lib/utils";
import { getNameInitials } from "@/utils";
import { getRealtimeChannel } from "@/utils/channel";
import { orpcClient, queryClient, queryUtils } from "@/utils/orpc";

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export const PinnedMessages = ({ channelId }: { channelId: string }) => {
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [accordionValue, setAccordionValue] =
    useState<string>("pinned-messages");
  const [_isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  const channel = getRealtimeChannel(channelId);
  const { data: pinnedMessages } = useSuspenseQuery(
    queryUtils.communication.message.getPinnedMessages.queryOptions({
      input: {
        channelId,
        query: debouncedQuery,
      },
    })
  );

  usePinnedMessagesRealtime({ channelId });

  const {
    mutateAsync: unPinMessage,
    isPending: isUnPinningMessage,
    variables,
  } = useMutation(
    queryUtils.communication.message.unPin.mutationOptions({
      onMutate: (variableData) => {
        const previousChannelMessages = queryClient.getQueryData(
          queryUtils.communication.message.getChannelMessages.queryKey({
            input: {
              channelId,
            },
          })
        );
        const previousPinnedMessages = queryClient.getQueryData(
          queryUtils.communication.message.getPinnedMessages.queryKey({
            input: { channelId },
          })
        );

        queryClient.setQueryData(
          queryUtils.communication.message.getChannelMessages.queryKey({
            input: {
              channelId,
            },
          }),
          (old) => {
            if (!old) return;
            const updatedMessages = old.messages.map((message) =>
              message.id === variableData.messageId
                ? {
                    ...message,
                    isPinned: false,
                    pinnedAt: null,
                  }
                : message
            );
            return {
              ...old,
              messages: updatedMessages,
            };
          }
        );

        queryClient.setQueryData(
          queryUtils.communication.message.getPinnedMessages.queryKey({
            input: { channelId },
          }),
          (old) => {
            if (!old) return old;
            return old.filter((m) => m.id !== variableData.messageId);
          }
        );

        return { previousChannelMessages, previousPinnedMessages };
      },
      onError: (_err, _variableData, context) => {
        if (context?.previousChannelMessages) {
          queryClient.setQueryData(
            queryUtils.communication.message.getChannelMessages.queryKey({
              input: {
                channelId,
              },
            }),
            context.previousChannelMessages
          );
        }
        if (context?.previousPinnedMessages) {
          queryClient.setQueryData(
            queryUtils.communication.message.getPinnedMessages.queryKey({
              input: { channelId },
            }),
            context.previousPinnedMessages
          );
        }
      },
      onSuccess: async (_, variableData) => {
        await channel.send({
          type: "broadcast",
          event: "message-unpinned",
          payload: {
            messageId: variableData.messageId,
          },
        });
      },
    })
  );

  useEffect(() => {
    if (showSearch) {
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [showSearch]);

  useEffect(() => {
    if (accordionValue === "" && showSearch) {
      setShowSearch(false);
    }
  }, [accordionValue, showSearch]);

  useEffect(() => {
    channel.on("broadcast", { event: "message-pinned" }, async (payload) => {
      const { messageId } = payload.payload as unknown as {
        messageId: string;
      };

      const message = await orpcClient.communication.message.get({
        messageId,
      });

      if (!message) return;

      queryClient.setQueryData(
        queryUtils.communication.message.getPinnedMessages.queryKey({
          input: { channelId },
        }),
        (old) => {
          if (!old) return old;
          // Prevent duplicate entries in the pinned messages cache
          if (old.some((m) => m.id === message.id)) return old;
          return [...old, message];
        }
      );
    });

    channel.on("broadcast", { event: "message-unpinned" }, (payload) => {
      const { messageId } = payload.payload as unknown as {
        messageId: string;
      };

      queryClient.setQueryData(
        queryUtils.communication.message.getChannelMessages.queryKey({
          input: { channelId },
        }),
        (old) => {
          if (!old) return;

          const updatedMessages = old.messages.map((message) => {
            if (message.id !== messageId) return message;
            return { ...message, isPinned: false, pinnedAt: null };
          });

          return {
            messages: updatedMessages,
          };
        }
      );

      queryClient.setQueryData(
        queryUtils.communication.message.getPinnedMessages.queryKey({
          input: { channelId },
        }),
        (old) => {
          if (!old) return;
          const updatedMessages = old.filter(
            (message) => message.id !== messageId
          );

          return updatedMessages;
        }
      );
    });

    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  });

  const handleSearchClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    const isAccordionClosed = accordionValue === "";

    if (isAccordionClosed) {
      setAccordionValue("pinned-messages");
      startTransition(() => {
        setTimeout(() => {
          setShowSearch(true);
        }, 250);
      });
    } else {
      setShowSearch((s) => !s);
    }
  };

  return (
    <Accordion
      collapsible
      onValueChange={setAccordionValue}
      type="single"
      value={accordionValue}
    >
      <AccordionItem value="pinned-messages">
        <AccordionTrigger className="px-0 hover:no-underline">
          <div className="flex flex-1 items-center gap-1.5">
            <Pin className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium text-foreground text-sm">
              Pinned Messages
            </h4>
          </div>
          <Button
            aria-label={showSearch ? "Close search" : "Open search"}
            className="h-6 w-6"
            onClick={handleSearchClick}
            size="icon"
            variant="ghost"
          >
            {showSearch ? (
              <SearchX className="h-3 w-3" />
            ) : (
              <Search className="h-3 w-3" />
            )}
          </Button>
        </AccordionTrigger>
        <AccordionContent className="pt-0">
          <div
            className={cn(
              "overflow-hidden transition-[max-height,opacity,transform] duration-200 ease-out",
              showSearch
                ? "max-h-16 translate-y-0 opacity-100"
                : "-translate-y-1 max-h-0 opacity-0"
            )}
          >
            <div className="relative p-3">
              <Input
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pinned messages..."
                ref={inputRef}
                value={query}
              />
              {query && (
                <Button
                  aria-label="Clear search"
                  className="-translate-y-1/2 absolute top-1/2 right-4 h-5 w-5"
                  onClick={() => setQuery("")}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {pinnedMessages.length === 0 && query.trim() && (
              <p className="py-4 text-center text-muted-foreground text-sm">
                No messages found matching "{query}"
              </p>
            )}
            {pinnedMessages.map((message) => (
              <div
                className="rounded-lg border border-border/50 bg-muted/30 p-3"
                key={message.id}
              >
                <div className="mb-1 flex items-start gap-2">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="font-medium text-primary text-xs">
                      {getNameInitials(message.sender.name)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-medium text-foreground text-sm">
                        {message.sender.name}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {formatRelativeTime(message.createdAt)}
                      </span>
                      <Button
                        aria-label="Unpin message"
                        className="ml-auto h-7 w-7 text-muted-foreground"
                        disabled={
                          isUnPinningMessage &&
                          variables.messageId === message.id
                        }
                        onClick={() => unPinMessage({ messageId: message.id })}
                        size="icon"
                        title="Unpin"
                        variant="ghost"
                      >
                        {isUnPinningMessage &&
                        variables.messageId === message.id ? (
                          <Loader className="animate-spin" />
                        ) : (
                          <PinOff className="size-4" />
                        )}
                      </Button>
                    </div>
                    <p className="line-clamp-2 text-muted-foreground text-sm">
                      {message.content || (
                        <em className="text-muted-foreground/60">No content</em>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export const PinnedMessagesSkeleton = () => (
  <Accordion collapsible type="single" value="pinned-messages">
    <AccordionItem value="pinned-messages">
      <AccordionTrigger className="px-0 hover:no-underline">
        <div className="flex flex-1 items-center gap-1.5">
          <Pin className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-medium text-foreground text-sm">
            Pinned Messages
          </h4>
        </div>
        <Button
          aria-label="Open search"
          className="h-6 w-6"
          size="icon"
          title="Open search"
          variant="ghost"
        >
          <Search className="h-3 w-3" />
        </Button>
      </AccordionTrigger>
      <AccordionContent className="pt-0">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              className="rounded-lg border border-border/50 bg-muted/30 p-3"
              key={index.toString()}
            >
              <div className="mb-1 flex items-start gap-2">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Skeleton className="h-3 w-3 rounded-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                    <Button
                      aria-label="Unpin message"
                      className="ml-auto h-7 w-7 text-muted-foreground"
                      disabled
                      size="icon"
                      title="Unpin"
                      variant="ghost"
                    >
                      <PinOff className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);
