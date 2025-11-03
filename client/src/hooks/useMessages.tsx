import { useState, useEffect, useCallback } from "react";
import { Message } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messagesService } from "@/services/messages.service";

const MESSAGES_PER_PAGE = 10;

export const useMessages = () => {
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [oldestMessageId, setOldestMessageId] = useState<string | undefined>();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const loadInitialMessages = useCallback(async () => {
    setIsInitialLoading(true);
    setError(null);
    try {
      const result = await messagesService.getMessages({
        limit: MESSAGES_PER_PAGE,
      });

      setAllMessages(result.messages);
      setOldestMessageId(result.oldestMessageId);
      setHasMore(result.hasMore);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to load messages");
      setError(error);
      console.error("Error loading initial messages:", error);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialMessages();
  }, [loadInitialMessages, retryTrigger]);

  const retry = useCallback(() => {
    setRetryTrigger((prev) => prev + 1);
  }, []);

  const loadMoreMessages = useCallback(async () => {
    if (isLoadingMore || !hasMore || !oldestMessageId) return;

    setIsLoadingMore(true);
    setError(null);
    try {
      const result = await messagesService.getMessages({
        limit: MESSAGES_PER_PAGE,
        oldestMessageId,
      });

      setAllMessages((prev) => [...result.messages, ...prev]);
      setOldestMessageId(result.oldestMessageId);
      setHasMore(result.hasMore);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to load more messages");
      setError(error);
      console.error("Error loading more messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [oldestMessageId, hasMore, isLoadingMore]);

  const appendMessage = useCallback((message: Message) => {
    setAllMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) {
        return prev;
      }
      return [...prev, message];
    });
  }, []);

  useEffect(() => {
    setAppendMessageCallback(appendMessage);
    return () => {
      setAppendMessageCallback(() => {});
    };
  }, [appendMessage]);

  return {
    data: allMessages,
    isLoading: isInitialLoading,
    error,
    hasMore,
    isLoadingMore,
    loadMoreMessages,
    appendMessage,
    retry,
  };
};

let appendMessageCallback: ((message: Message) => void) | null = null;

export const setAppendMessageCallback = (
  callback: (message: Message) => void
) => {
  appendMessageCallback = callback;
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  const sendMessage = async (newMessage: {
    content?: string;
    media?: string;
  }): Promise<Message> => {
    const message = await messagesService.createMessage(newMessage);

    if (appendMessageCallback) {
      appendMessageCallback(message);
    }

    return message;
  };
  
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
};
