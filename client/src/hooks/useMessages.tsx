import { useCallback, useMemo } from "react";
import { Message } from "@/types";
import { 
  useQueryClient, 
  useInfiniteQuery,
  InfiniteData,
} from "@tanstack/react-query";
import { messagesService } from "@/services/messages.service";
import { useWebSocket } from "./useWebSocket";

const MESSAGES_PER_PAGE = 10;
const MESSAGES_QUERY_KEY = ["messages"];

export const useMessages = () => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: MESSAGES_QUERY_KEY,
    queryFn: async ({ pageParam }: { pageParam?: string }) => {
      const result = await messagesService.getMessages({
        limit: MESSAGES_PER_PAGE,
        oldestMessageId: pageParam,
      });
      return result;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.oldestMessageId,
  });

  // Handle WebSocket messages - add to the first page without resetting pagination
  const handleNewMessage = useCallback(
    (message: Message) => {
      queryClient.setQueryData<InfiniteData<{
        messages: Message[];
        hasMore: boolean;
        oldestMessageId?: string;
      }>>(MESSAGES_QUERY_KEY, (oldData) => {
        if (!oldData) {
          return {
            pages: [
              {
                messages: [message],
                hasMore: false,
              },
            ],
            pageParams: [undefined],
          };
        }

        // Check if message already exists (avoid duplicates)
        const messageExists = oldData.pages.some((page) =>
          page.messages.some((m) => m.id === message.id)
        );

        if (messageExists) {
          return oldData;
        }

        // Add to the first page (newest messages)
        const firstPage = oldData.pages[0];
        const updatedFirstPage = {
          ...firstPage,
          messages: [...firstPage.messages, message],
        };

        return {
          ...oldData,
          pages: [updatedFirstPage, ...oldData.pages.slice(1)],
        };
      });
    },
    [queryClient]
  );

  // Set up WebSocket connection
  useWebSocket(handleNewMessage);

  // Flatten all messages from all pages
  // Pages are ordered: [newest_page, older_page_1, older_page_2, ...]
  // Within each page, messages are ordered: [oldest, ..., newest]
  // We need to flatten in order: [older_page_2, ..., older_page_1, newest_page]
  // to get chronological order: [oldest, ..., newest]
  const allMessages = useMemo(() => {
    if (!data) return [];
    // Reverse pages to get older pages first, then flatten
    const reversedPages = [...data.pages].reverse();
    return reversedPages.flatMap((page) => page.messages);
  }, [data]);

  const loadMoreMessages = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    data: allMessages,
    isLoading,
    error: error as Error | null,
    hasMore: hasNextPage ?? false,
    isLoadingMore: isFetchingNextPage,
    loadMoreMessages,
    retry: refetch,
  };
};
