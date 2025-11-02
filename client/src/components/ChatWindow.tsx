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

  const virtualizer = useVirtualizer({
    count: messages?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  useEffect(() => {
    if (messages && messages.length > 0 && parentRef.current) {
      setTimeout(() => {
        if (parentRef.current) {
          parentRef.current.scrollTop = parentRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages]);

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

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <MessageBubble message={message} isCurrentUser={isCurrentUser} />
            </div>
          );
        })}
      </div>
    </Box>
  );
};
