import { useRef, useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Message } from "@/types";
import { MessageBubble } from "@/components/MessageBubble";

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  error: any;
  currentUserEmail: string;
}

export const ChatWindow = ({
  messages,
  isLoading,
  error,
  currentUserEmail,
}: ChatWindowProps) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const previousMessageCountRef = useRef(0);

  const virtualizer = useVirtualizer({
    count: messages?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const shouldShowDateHeader = (currentIndex: number): boolean => {
    if (currentIndex === 0) return true;

    const currentMessage = messages[currentIndex];
    const previousMessage = messages[currentIndex - 1];

    return !isSameDay(
      new Date(currentMessage.timestamp),
      new Date(previousMessage.timestamp)
    );
  };

  useEffect(() => {
    if (messages && messages.length > 0 && parentRef.current) {
      const messageCountChanged =
        messages.length !== previousMessageCountRef.current;

      if (messageCountChanged) {
        previousMessageCountRef.current = messages.length;

        setTimeout(() => {
          if (parentRef.current && shouldAutoScrollRef.current) {
            parentRef.current.scrollTo({
              top: parentRef.current.scrollHeight,
              behavior: "smooth",
            });
          }
        }, 100);
      }
    }
  }, [messages]);

  useEffect(() => {
    const scrollElement = parentRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      shouldAutoScrollRef.current = isAtBottom;
    };

    scrollElement.addEventListener("scroll", handleScroll);
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Typography color="error">Failed to load messages</Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={parentRef}
      sx={{
        height: "100%",
        overflowY: "auto",
        backgroundColor: "background.default",
        position: "relative",
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(0,0,0,0.2)",
          borderRadius: "4px",
        },
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const message = messages[virtualItem.index];
          const isCurrentUser = message.user === currentUserEmail;
          const showDateHeader = shouldShowDateHeader(virtualItem.index);

          return (
            <div
              key={virtualItem.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <MessageBubble
                message={message}
                isCurrentUser={isCurrentUser}
                showDateHeader={showDateHeader}
              />
            </div>
          );
        })}
      </div>
    </Box>
  );
};
