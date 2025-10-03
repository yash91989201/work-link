import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Loader, Pin, PinOff, Search, X } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { queryClient, queryUtils } from "@/utils/orpc";
import { user } from "../../../../../../../server/src/db/schema";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

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

export const PinnedMessages = ({
  channelId,
  onUnpin,
}: {
  channelId: string;
  onUnpin?: (id: string) => void;
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [accordionValue, setAccordionValue] =
    useState<string>("pinned-messages");
  const [_isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    data: { messages = [] },
  } = useSuspenseQuery(
    queryUtils.communication.messages.getChannelMessages.queryOptions({
      input: {
        channelId,
        pinned: true,
      },
    })
  );

  const { mutateAsync: unPinMessage, isPending: isUnPinningMessage } =
    useMutation(
      queryUtils.communication.messages.unPin.mutationOptions({
        onSuccess: (_data, { messageId }) => {
          queryClient.setQueryData(
            queryUtils.communication.messages.getChannelMessages.queryKey({
              input: {
                channelId,
                pinned: true,
              },
            }),
            (old) => {
              if (!old) return;

              const updatedMessages = old.messages.map((message) => {
                if (message.id !== messageId) return message;

                return {
                  ...message,
                  pin: false,
                  pinnedBy: null,
                };
              });

              return {
                ...old,
                messages: updatedMessages,
              };
            }
          );
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

  // Filter pinned messages based on search query
  const filteredMessages = query.trim()
    ? messages.filter(
        (message) =>
          message.content?.toLowerCase().includes(query.toLowerCase()) ||
          message.sender.name.toLowerCase().includes(query.toLowerCase())
      )
    : messages;

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
              <X className="h-3 w-3" />
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
            <div className="p-3">
              <Input
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pinned messages..."
                ref={inputRef}
                value={query}
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredMessages.length === 0 && query.trim() && (
              <p className="py-4 text-center text-muted-foreground text-sm">
                No messages found matching "{query}"
              </p>
            )}
            {filteredMessages.map((message) => (
              <div
                className="rounded-lg border border-border/50 bg-muted/30 p-3"
                key={message.id}
              >
                <div className="mb-1 flex items-start gap-2">
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="font-medium text-primary text-xs">
                      {getInitials(message.sender.name)}
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
                        disabled={isUnPinningMessage}
                        onClick={() => unPinMessage({ messageId: message.id })}
                        size="icon"
                        title="Unpin"
                        variant="ghost"
                      >
                        {isUnPinningMessage ? (
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

export const PinnedMessagesSkeleton = () => {
  return (
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
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
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
};
