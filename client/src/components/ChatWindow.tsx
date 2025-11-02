import { useRef, useEffect, useLayoutEffect } from "react";
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
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const imageDimensionsRef = useRef<
    Map<string, { width: number; height: number }>
  >(new Map());
  const shouldAutoScrollRef = useRef(true);
  const previousMessageCountRef = useRef(0);

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

  const estimateSize = (index: number): number => {
    const message = messages[index];
    if (!message) return 100;

    let estimatedHeight = 0;

    if (shouldShowDateHeader(index)) {
      estimatedHeight += 58;
    }

    estimatedHeight += 80;

    if (message.media) {
      const dimensions = imageDimensionsRef.current.get(message.media);
      if (dimensions) {
        const containerWidth = parentRef.current?.clientWidth || 500;
        const maxWidth = containerWidth * 0.7;
        const maxHeight = 300;

        const aspectRatio = dimensions.width / dimensions.height;

        let renderedWidth = dimensions.width;
        let renderedHeight = dimensions.height;

        if (renderedWidth > maxWidth) {
          renderedWidth = maxWidth;
          renderedHeight = maxWidth / aspectRatio;
        }

        if (renderedHeight > maxHeight) {
          renderedHeight = maxHeight;
          renderedWidth = maxHeight * aspectRatio;
        }

        estimatedHeight += renderedHeight;
      } else {
        estimatedHeight += 150;
      }
    }

    if (message.content) {
      const lines = Math.ceil(message.content.length / 40);
      estimatedHeight += lines * 20;
      if (message.media) {
        estimatedHeight += 8;
      }
    }

    return estimatedHeight;
  };

  const virtualizer = useVirtualizer({
    count: messages?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 5,
  });

  useEffect(() => {
    messages.forEach((message) => {
      if (message.media && !imageDimensionsRef.current.has(message.media)) {
        const img = new Image();
        img.onload = () => {
          imageDimensionsRef.current.set(message.media!, {
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
          virtualizer.measure();
        };
        img.onerror = () => {
          imageDimensionsRef.current.set(message.media!, {
            width: 800,
            height: 600,
          });
          virtualizer.measure();
        };
        img.src = message.media;
      }
    });
  }, [messages, virtualizer]);

  useLayoutEffect(() => {
    const virtualItems = virtualizer.getVirtualItems();
    virtualItems.forEach((virtualItem) => {
      const element = itemRefs.current.get(virtualItem.index);
      if (element) {
        virtualizer.measureElement(element);
      }
    });
  }, [virtualizer, messages.length]);

  useEffect(() => {
    const handleImageLoad = () => {
      virtualizer.getVirtualItems().forEach((virtualItem) => {
        const element = itemRefs.current.get(virtualItem.index);
        if (element) {
          virtualizer.measureElement(element);
        }
      });
    };

    const images = parentRef.current?.querySelectorAll("img");
    images?.forEach((img) => {
      if (img.complete) {
        handleImageLoad();
      } else {
        img.addEventListener("load", handleImageLoad);
        img.addEventListener("error", handleImageLoad);
      }
    });

    return () => {
      images?.forEach((img) => {
        img.removeEventListener("load", handleImageLoad);
        img.removeEventListener("error", handleImageLoad);
      });
    };
  }, [virtualizer, messages]);

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
