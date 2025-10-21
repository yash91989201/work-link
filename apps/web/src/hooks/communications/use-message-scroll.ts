import { useCallback, useRef } from "react";

export function useMessageScroll() {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  const scrollToTop = useCallback(() => {
    messagesEndRef.current?.parentElement?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return {
    messagesEndRef,
    scrollToBottom,
    scrollToTop,
  };
}
