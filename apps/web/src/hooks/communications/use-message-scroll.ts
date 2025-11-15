import { useCallback, useRef } from "react";

export function useMessageScroll() {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
