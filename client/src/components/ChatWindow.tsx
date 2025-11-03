import { useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Message } from "@/types";
import { MessageBubble } from "@/components/MessageBubble";

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
  const handledImagesRef = useRef<WeakSet<HTMLImageElement>>(new WeakSet());
  const shouldAutoScrollRef = useRef(true);
  const previousMessageCountRef = useRef(0);
  const isLoadingMoreRef = useRef(false);
  const previousScrollHeightRef = useRef(0);
  const previousFirstMessageIdRef = useRef<string | null>(null);
  const previousLastMessageIdRef = useRef<string | null>(null);
  const anchorMessageIdRef = useRef<string | null>(null);
  const anchorMessageIndexRef = useRef<number | null>(null);
  const anchorMessageOffsetRef = useRef<number>(0);
  const previousScrollTopRef = useRef<number>(0);
  const hasInitialScrollCompletedRef = useRef(false);

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

  const estimateSize = useMemo(() => {
    return (index: number): number => {
      const message = messages[index];
      if (!message) return 100;

      const isCurrentUser = message.user.email === currentUserEmail;
      let estimatedHeight = 0;

      if (shouldShowDateHeader(index)) {
        estimatedHeight += 58;
      }

      estimatedHeight += 82;

      if (isCurrentUser) {
        estimatedHeight -= 20;
      }

      if (message.media) {
        const dimensions = imageDimensionsRef.current.get(message.media);
        if (dimensions) {
          const containerWidth = parentRef.current?.clientWidth || 500;
          // Match mobile breakpoint: use 85% on mobile (xs), 70% on larger screens
          const isMobile = containerWidth < 600;
          const maxWidth = containerWidth * (isMobile ? 0.85 : 0.7);
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
        const containerWidth = parentRef.current?.clientWidth || 500;
        // Detect mobile: use 85% max width on mobile (xs), 70% on larger screens
        const isMobile = containerWidth < 600; // Material-UI sm breakpoint is 600px
        const maxBubbleWidth = containerWidth * (isMobile ? 0.85 : 0.7);
        
        // Account for padding: px: { xs: 1.5 (12px), sm: 2 (16px) } and Paper padding: 1.75 (14px)
        const horizontalPadding = isMobile ? 12 + 14 : 16 + 14; // px + Paper padding
        const maxTextWidth = maxBubbleWidth - horizontalPadding * 2;
        
        // Font size is 0.9375rem (15px), estimate average character width at ~9px
        // This accounts for mixed character widths (some wider, some narrower)
        const avgCharWidth = 9;
        const charsPerLine = Math.max(1, Math.floor(maxTextWidth / avgCharWidth));
        
        const contentLines = message.content.split('\n');
        let totalLines = 0;
        
        contentLines.forEach((lineSegment) => {
          if (lineSegment.length > 0) {
            const wrappedLines = Math.ceil(lineSegment.length / charsPerLine);
            totalLines += wrappedLines;
          } else {
            totalLines += 1;
          }
        });
        
        totalLines = Math.max(1, totalLines);
        
        // Actual line height: 1.5 * 15px (font-size) = 22.5px, round to 23px
        const lineHeight = 23;
        estimatedHeight += totalLines * lineHeight;
        
        if (message.media) {
          estimatedHeight += 10;
        }
      }

      return estimatedHeight;
    };
  }, [messages, currentUserEmail]);

  const virtualizer = useVirtualizer({
    count: messages?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 5,
  });

  useEffect(() => {
    virtualizer.measure();
  }, [messages, currentUserEmail, virtualizer]);

  // Recalculate sizes when window resizes (e.g., mobile rotation, window resize)
  useEffect(() => {
    const handleResize = () => {
      virtualizer.measure();
    };

    window.addEventListener('resize', handleResize);
    // Also listen to ResizeObserver for container size changes
    const resizeObserver = new ResizeObserver(() => {
      virtualizer.measure();
    });

    if (parentRef.current) {
      resizeObserver.observe(parentRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [virtualizer]);

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
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          virtualizer.getVirtualItems().forEach((virtualItem) => {
            const element = itemRefs.current.get(virtualItem.index);
            if (element) {
              virtualizer.measureElement(element);
            }
          });
          virtualizer.measure();
        });
      });
    };

    const handleCustomImageLoad = (e: Event) => {
      const target = e.target as HTMLElement;
      const index = target.getAttribute('data-index');
      if (index !== null) {
        const element = itemRefs.current.get(parseInt(index, 10));
        if (element) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              virtualizer.measureElement(element);
              virtualizer.measure();
            });
          });
        }
      }
    };

    const setupImageListeners = () => {
      const images = parentRef.current?.querySelectorAll("img");
      images?.forEach((img) => {
        if (handledImagesRef.current.has(img)) {
          return;
        }
        handledImagesRef.current.add(img);
        
        if (img.complete && img.naturalHeight !== 0) {
          setTimeout(handleImageLoad, 0);
        } else {
          img.addEventListener("load", handleImageLoad, { once: true });
          img.addEventListener("error", handleImageLoad, { once: true });
        }
      });
    };

    if (parentRef.current) {
      parentRef.current.addEventListener('imageLoaded', handleCustomImageLoad);
    }

    setupImageListeners();

    let timeoutId: NodeJS.Timeout | null = null;
    const observer = new MutationObserver(() => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(setupImageListeners, 50);
    });

    if (parentRef.current) {
      observer.observe(parentRef.current, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      observer.disconnect();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (parentRef.current) {
        parentRef.current.removeEventListener('imageLoaded', handleCustomImageLoad);
      }
    };
  }, [virtualizer, messages]);

  useEffect(() => {
    if (!isLoadingMore) {
      isLoadingMoreRef.current = false;
    }
  }, [isLoadingMore]);

  useLayoutEffect(() => {
    if (
      messages.length > 0 &&
      parentRef.current &&
      isLoadingMoreRef.current &&
      anchorMessageIndexRef.current !== null &&
      previousScrollTopRef.current > 0
    ) {
      const scrollElement = parentRef.current;
      const anchorIndexBefore = anchorMessageIndexRef.current;
      const anchorOffset = anchorMessageOffsetRef.current;

      const messageCountBefore = previousMessageCountRef.current;
      const messageCountNow = messages.length;
      const messagesAdded = messageCountNow - messageCountBefore;
      const newAnchorIndex = anchorIndexBefore + messagesAdded;

      let estimatedScrollTop = 0;
      for (let i = 0; i < newAnchorIndex; i++) {
        estimatedScrollTop += estimateSize(i);
      }
      estimatedScrollTop += anchorOffset;

      virtualizer.measure();

      const virtualItems = virtualizer.getVirtualItems();
      const anchorVirtualItem = virtualItems.find(
        (item) => item.index === newAnchorIndex
      );

      if (anchorVirtualItem) {
        const anchorTop = anchorVirtualItem.start;
        scrollElement.scrollTop = anchorTop + anchorOffset;
      } else {
        scrollElement.scrollTop = estimatedScrollTop;

        requestAnimationFrame(() => {
          virtualizer.measure();
          const newVirtualItems = virtualizer.getVirtualItems();
          const newAnchorVirtualItem = newVirtualItems.find(
            (item) => item.index === newAnchorIndex
          );

          if (newAnchorVirtualItem && scrollElement) {
            const anchorTop = newAnchorVirtualItem.start;
            scrollElement.scrollTop = anchorTop + anchorOffset;
          }
        });
      }

      setTimeout(() => {
        isLoadingMoreRef.current = false;
        anchorMessageIdRef.current = null;
        anchorMessageIndexRef.current = null;
      }, 10);
    }
  }, [messages, virtualizer]);

  useLayoutEffect(() => {
    if (
      messages.length > 0 &&
      parentRef.current &&
      previousMessageCountRef.current === 0 &&
      !hasInitialScrollCompletedRef.current &&
      !isLoading
    ) {
      virtualizer.measure();
      shouldAutoScrollRef.current = true;
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (parentRef.current) {
            parentRef.current.scrollTop = parentRef.current.scrollHeight;
            
            setTimeout(() => {
              hasInitialScrollCompletedRef.current = true;
            }, 150);
          }
        });
      });
    }
  }, [messages.length, virtualizer, isLoading]);

  useEffect(() => {
    if (messages && messages.length > 0 && parentRef.current) {
      const messageCountChanged =
        messages.length !== previousMessageCountRef.current;
      const previousCount = previousMessageCountRef.current;
      const firstMessageId = messages[0]?.id;
      const previousFirstMessageId = previousFirstMessageIdRef.current;

      if (messageCountChanged) {
        if (
          !(
            messages.length > previousCount &&
            isLoadingMoreRef.current &&
            firstMessageId !== previousFirstMessageId &&
            previousFirstMessageId !== null
          )
        ) {
          const lastMessageId = messages[messages.length - 1]?.id;

          const messageAppended =
            lastMessageId !== previousLastMessageIdRef.current &&
            previousCount > 0 &&
            messages.length > previousCount;

          if (messageAppended) {
            const newMessage = messages[messages.length - 1];
            const isFromCurrentUser =
              newMessage?.user.email === currentUserEmail;
            const shouldScroll =
              isFromCurrentUser || shouldAutoScrollRef.current;

            virtualizer.measure();

            setTimeout(() => {
              const lastIndex = messages.length - 1;
              const element = itemRefs.current.get(lastIndex);
              if (element) {
                virtualizer.measureElement(element);
              }
              virtualizer.measure();
            }, 0);

            if (shouldScroll) {
              setTimeout(() => {
                if (parentRef.current) {
                  parentRef.current.scrollTo({
                    top: parentRef.current.scrollHeight,
                    behavior: "smooth",
                  });
                }
              }, 150);
            }
          }
        }

        previousMessageCountRef.current = messages.length;
        previousFirstMessageIdRef.current = firstMessageId;
        previousLastMessageIdRef.current =
          messages[messages.length - 1]?.id || null;
      }
    }
  }, [messages, virtualizer]);

  useEffect(() => {
    const scrollElement = parentRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      shouldAutoScrollRef.current = isAtBottom;

      const isAtTop = scrollTop < 100;
      if (
        isAtTop &&
        hasMore &&
        !isLoadingMoreRef.current &&
        !isLoadingMore &&
        hasInitialScrollCompletedRef.current
      ) {
        isLoadingMoreRef.current = true;
        previousScrollHeightRef.current = scrollHeight;
        previousScrollTopRef.current = scrollTop;
        previousFirstMessageIdRef.current = messages[0]?.id || null;

        const virtualItems = virtualizer.getVirtualItems();
        if (virtualItems.length > 0 && parentRef.current) {
          const firstVisibleItem = virtualItems[0];
          const anchorMessage = messages[firstVisibleItem.index];

          if (anchorMessage) {
            anchorMessageIdRef.current = anchorMessage.id;
            anchorMessageIndexRef.current = firstVisibleItem.index;

            const anchorElement = itemRefs.current.get(firstVisibleItem.index);
            if (anchorElement && parentRef.current) {
              const anchorRect = anchorElement.getBoundingClientRect();
              const parentRect = parentRef.current.getBoundingClientRect();
              anchorMessageOffsetRef.current = anchorRect.top - parentRect.top;
            }
          }
        }

        onLoadMore();
      }
    };

    scrollElement.addEventListener("scroll", handleScroll);
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [hasMore, isLoadingMore, onLoadMore, messages, virtualizer]);

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
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }

  if (error && messages.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          gap: 2,
          px: 2,
        }}
      >
        <Typography
          color="error"
          variant="body1"
          sx={{
            fontSize: "0.9375rem",
            textAlign: "center",
          }}
        >
          {error?.message || "Failed to load messages"}
        </Typography>
        {onRetry && (
          <Button
            variant="contained"
            onClick={onRetry}
            disabled={isLoading}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 2,
              py: 1,
            }}
          >
            Retry
          </Button>
        )}
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
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 1.5,
            zIndex: 1,
            backgroundColor: "rgba(211, 47, 47, 0.08)",
            backdropFilter: "blur(10px)",
            gap: 1.5,
            borderRadius: "0 0 12px 12px",
          }}
        >
          <Typography color="error" variant="body2" sx={{ fontSize: "0.8125rem" }}>
            {error?.message || "Failed to load more messages"}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              minWidth: "auto",
              px: 1.5,
            }}
          >
            Retry
          </Button>
        </Box>
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
