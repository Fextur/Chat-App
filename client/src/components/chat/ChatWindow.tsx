import {
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useCallback,
} from "react";
import { Box, CircularProgress } from "@mui/material";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Message } from "@/types";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatWindowError } from "@/components/chat/ChatWindowError";
import { ChatWindowLoading } from "@/components/chat/ChatWindowLoading";
import { useChatWindowScroll } from "@/hooks/chat/useChatWindowScroll";
import { useChatWindowImages } from "@/hooks/chat/useChatWindowImages";
import { isSameDay } from "@/utils/dateUtils";
import { createSizeEstimator } from "@/utils/sizeEstimation";

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  error: any;
  currentUserEmail: string;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onRetry?: () => void;
}

export const ChatWindow = ({
  messages,
  isLoading,
  error,
  currentUserEmail,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onRetry,
}: ChatWindowProps) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const imageDimensionsRef = useRef<
    Map<string, { width: number; height: number }>
  >(new Map());

  const shouldShowDateHeader = useCallback(
    (currentIndex: number): boolean => {
      if (currentIndex === 0) return true;

      const currentMessage = messages[currentIndex];
      const previousMessage = messages[currentIndex - 1];

      return !isSameDay(
        new Date(currentMessage.timestamp),
        new Date(previousMessage.timestamp)
      );
    },
    [messages]
  );

  const estimateSize = useMemo(() => {
    return createSizeEstimator({
      messages,
      currentUserEmail,
      imageDimensionsRef,
      parentRef,
      shouldShowDateHeader,
    });
  }, [messages, currentUserEmail, shouldShowDateHeader]);

  const virtualizer = useVirtualizer({
    count: messages?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 5,
  });

  useEffect(() => {
    virtualizer.measure();
  }, [messages, currentUserEmail, virtualizer]);

  useEffect(() => {
    const handleResize = () => {
      virtualizer.measure();
    };

    window.addEventListener("resize", handleResize);
    const resizeObserver = new ResizeObserver(() => {
      virtualizer.measure();
    });

    if (parentRef.current) {
      resizeObserver.observe(parentRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
    };
  }, [virtualizer]);

  useLayoutEffect(() => {
    const virtualItems = virtualizer.getVirtualItems();
    virtualItems.forEach((virtualItem) => {
      const element = itemRefs.current.get(virtualItem.index);
      if (element) {
        virtualizer.measureElement(element);
      }
    });
  }, [virtualizer, messages.length]);

  useChatWindowImages({
    messages,
    virtualizer,
    itemRefs,
    parentRef,
    imageDimensionsRef,
  });

  useChatWindowScroll({
    messages,
    hasMore,
    isLoadingMore,
    onLoadMore,
    virtualizer,
    itemRefs,
    parentRef,
    estimateSize,
    currentUserEmail,
  });

  if (isLoading) {
    return <ChatWindowLoading />;
  }

  if (error && messages.length === 0) {
    return (
      <ChatWindowError
        error={error}
        onRetry={onRetry}
        isLoading={isLoading}
        hasMessages={false}
      />
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
          width: "6px",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(0, 0, 0, 0.12)",
          borderRadius: "3px",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.18)",
          },
        },
      }}
    >
      {error && messages.length > 0 && (
        <ChatWindowError
          error={error}
          onRetry={onLoadMore}
          isLoading={isLoadingMore}
          hasMessages={true}
        />
      )}
      {isLoadingMore && !error && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            padding: 1.5,
            zIndex: 1,
            backgroundColor: "background.default",
            borderRadius: "0 0 12px 12px",
          }}
        >
          <CircularProgress size={20} thickness={4} />
        </Box>
      )}
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const message = messages[virtualItem.index];
          if (!message) return null;

          const isCurrentUser = message.user.email === currentUserEmail;
          const showDateHeader = shouldShowDateHeader(virtualItem.index);

          return (
            <div
              key={virtualItem.key}
              ref={(el) => {
                if (el) {
                  itemRefs.current.set(virtualItem.index, el);
                } else {
                  itemRefs.current.delete(virtualItem.index);
                }
              }}
              data-index={virtualItem.index}
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
