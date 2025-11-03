import { useRef, useEffect, useLayoutEffect } from "react";
import { Virtualizer } from "@tanstack/react-virtual";
import { Message } from "@/types";

interface UseChatWindowScrollOptions {
  messages: Message[];
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  itemRefs: React.RefObject<Map<number, HTMLDivElement>>;
  parentRef: React.RefObject<HTMLDivElement | null>;
  estimateSize: (index: number) => number;
  currentUserEmail: string;
}

export const useChatWindowScroll = ({
  messages,
  hasMore,
  isLoadingMore,
  onLoadMore,
  virtualizer,
  itemRefs,
  parentRef,
  estimateSize,
  currentUserEmail,
}: UseChatWindowScrollOptions) => {
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
  }, [messages, virtualizer, parentRef, estimateSize]);

  useLayoutEffect(() => {
    if (
      messages.length > 0 &&
      parentRef.current &&
      previousMessageCountRef.current === 0 &&
      !hasInitialScrollCompletedRef.current
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
  }, [messages.length, virtualizer, parentRef]);

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
  }, [messages, virtualizer, parentRef, itemRefs, currentUserEmail]);

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
  }, [
    hasMore,
    isLoadingMore,
    onLoadMore,
    messages,
    virtualizer,
    parentRef,
    itemRefs,
  ]);
};
