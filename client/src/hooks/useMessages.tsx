import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/hooks/useUser";
import { Message, User } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const getUser = (email: string): User => {
  const nameMap: Record<string, string> = {
    "john@example.com": "John",
    "jane@example.com": "Jane",
    "bob@example.com": "Bob",
    "alice@example.com": "Alice",
    "you@example.com": "You",
  };
  return {
    email,
    name: nameMap[email] || email.split("@")[0],
  };
};

const generateMockMessages = (): Message[] => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const createMessage = (
    id: string,
    userEmail: string,
    content?: string,
    media?: string,
    timestamp?: Date
  ): Message => ({
    id,
    user: getUser(userEmail),
    content,
    media,
    timestamp: timestamp || new Date(),
  });

  return [
    createMessage(
      "1",
      "john@example.com",
      "Hey everyone! Hows it going?",
      undefined,
      new Date(twoDaysAgo.setHours(9, 0, 0, 0))
    ),
    createMessage(
      "2",
      "jane@example.com",
      "Hi John! Im doing great, thanks for asking!",
      undefined,
      new Date(twoDaysAgo.setHours(9, 5, 0, 0))
    ),
    createMessage(
      "3",
      "bob@example.com",
      "Good morning everyone! 🌞",
      undefined,
      new Date(twoDaysAgo.setHours(9, 10, 0, 0))
    ),
    createMessage(
      "4",
      "alice@example.com",
      "Check out this amazing sunset I captured!",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      new Date(twoDaysAgo.setHours(14, 30, 0, 0))
    ),
    createMessage(
      "4a",
      "jane@example.com",
      undefined,
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop",
      new Date(twoDaysAgo.setHours(14, 32, 0, 0))
    ),
    createMessage("5", "john@example.com", "Wow, thats beautiful! Where was this taken?", undefined, new Date(twoDaysAgo.setHours(14, 35, 0, 0))),
    createMessage("6", "alice@example.com", "Thanks! It was at the beach near Santa Monica", undefined, new Date(twoDaysAgo.setHours(14, 40, 0, 0))),
    createMessage("7", "jane@example.com", "Good evening! Anyone up for a movie tonight?", undefined, new Date(twoDaysAgo.setHours(18, 0, 0, 0))),
    createMessage("8", "bob@example.com", "Im in! What movie are we watching?", undefined, new Date(twoDaysAgo.setHours(18, 5, 0, 0))),
    createMessage("9", "john@example.com", "Good morning team!", undefined, new Date(yesterday.setHours(8, 0, 0, 0))),
    createMessage("10", "alice@example.com", "Morning John! Ready for the presentation?", undefined, new Date(yesterday.setHours(8, 15, 0, 0))),
    createMessage("11", "jane@example.com", "I have some ideas Id like to share", undefined, new Date(yesterday.setHours(10, 30, 0, 0))),
    createMessage("12", "bob@example.com", "Lets hear them!", undefined, new Date(yesterday.setHours(10, 35, 0, 0))),
    createMessage("13", "alice@example.com", "Heres the mockup Ive been working on", "https://static.thenounproject.com/png/4778723-200.png", new Date(yesterday.setHours(13, 20, 0, 0))),
    createMessage("13a", "bob@example.com", undefined, "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop", new Date(yesterday.setHours(13, 22, 0, 0))),
    createMessage("14", "john@example.com", "This looks fantastic! Great work!", undefined, new Date(yesterday.setHours(13, 25, 0, 0))),
    createMessage("15", "jane@example.com", "I agree! The colors really pop", undefined, new Date(yesterday.setHours(13, 30, 0, 0))),
    createMessage("16", "bob@example.com", "Should we schedule a meeting to discuss implementation?", undefined, new Date(yesterday.setHours(15, 0, 0, 0))),
    createMessage("17", "alice@example.com", "Yes, Im free tomorrow afternoon", undefined, new Date(yesterday.setHours(15, 10, 0, 0))),
    createMessage("18", "jane@example.com", "Good morning everyone! ☀️", undefined, new Date(now.setHours(7, 30, 0, 0))),
    createMessage("19", "john@example.com", "Morning! Ready for another productive day", undefined, new Date(now.setHours(8, 0, 0, 0))),
    createMessage("20", "bob@example.com", "Hey everyone!", undefined, new Date(now.setHours(8, 15, 0, 0))),
    createMessage("21", "alice@example.com", "Just finished my coffee ☕", undefined, new Date(now.setHours(9, 0, 0, 0))),
    createMessage("21a", "john@example.com", undefined, "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop", new Date(now.setHours(9, 5, 0, 0))),
    createMessage("22", "jane@example.com", "Anyone need help with anything today?", undefined, new Date(now.setHours(9, 30, 0, 0))),
    createMessage("23", "john@example.com", "I could use some feedback on the new feature", undefined, new Date(now.setHours(10, 0, 0, 0))),
    createMessage("24", "bob@example.com", "Sure! Send it over", undefined, new Date(now.setHours(10, 5, 0, 0))),
    createMessage("25", "alice@example.com", "Im happy to review it as well", undefined, new Date(now.setHours(10, 10, 0, 0))),
    createMessage("26", "jane@example.com", "Team lunch at noon?", undefined, new Date(now.setHours(11, 0, 0, 0))),
    createMessage("27", "john@example.com", "Count me in!", undefined, new Date(now.setHours(11, 2, 0, 0))),
    createMessage("28", "bob@example.com", "Sounds good to me", undefined, new Date(now.setHours(11, 5, 0, 0))),
    createMessage("29", "alice@example.com", "Perfect! See you all then 🍕", undefined, new Date(now.setHours(11, 10, 0, 0))),
    createMessage("30", "you@example.com", "Looking forward to it!", undefined, new Date(now.setHours(11, 15, 0, 0))),
    createMessage("31", "john@example.com", "Great! See you all at noon then", undefined, new Date(now.setHours(11, 20, 0, 0))),
    createMessage("32", "jane@example.com", "Perfect timing!", undefined, new Date(now.setHours(11, 25, 0, 0))),
    createMessage("33", "bob@example.com", "Looking forward to catching up with everyone", undefined, new Date(now.setHours(11, 30, 0, 0))),
    createMessage("34", "alice@example.com", "Me too! It's been a while since we all got together", undefined, new Date(now.setHours(11, 35, 0, 0))),
    createMessage("35", "john@example.com", "Absolutely! We should do this more often", undefined, new Date(now.setHours(11, 40, 0, 0))),
    createMessage("36", "jane@example.com", "Agreed! Team building is important", undefined, new Date(now.setHours(11, 45, 0, 0))),
    createMessage("37", "bob@example.com", "Couldn't agree more!", undefined, new Date(now.setHours(11, 50, 0, 0))),
    createMessage("38", "alice@example.com", "Well said, Bob!", undefined, new Date(now.setHours(11, 55, 0, 0))),
    createMessage("39", "john@example.com", "Quick question before we break - anyone have updates on the project?", undefined, new Date(now.setHours(12, 0, 0, 0))),
    createMessage("40", "jane@example.com", "Yes! I finished the frontend work yesterday", undefined, new Date(now.setHours(12, 5, 0, 0))),
    createMessage("41", "bob@example.com", "Backend is 90% done, should finish today", undefined, new Date(now.setHours(12, 10, 0, 0))),
    createMessage("42", "alice@example.com", "Design mockups are ready for review", undefined, new Date(now.setHours(12, 15, 0, 0))),
    createMessage("43", "john@example.com", "Excellent progress everyone! 🎉", undefined, new Date(now.setHours(12, 20, 0, 0))),
    createMessage("44", "bob@example.com", "Thanks John! Really excited about this project", undefined, new Date(now.setHours(12, 25, 0, 0))),
    createMessage("45", "bob@example.com", "Same here! Can't wait to see it live", undefined, new Date(now.setHours(12, 30, 0, 0))),
    createMessage("46", "alice@example.com", "The team has been doing amazing work!", undefined, new Date(now.setHours(12, 35, 0, 0))),
    createMessage("47", "bob@example.com", "Couldn't have said it better myself", undefined, new Date(now.setHours(12, 40, 0, 0))),
    createMessage("48", "bob@example.com", "Alright, time for lunch! 🍽️", undefined, new Date(now.setHours(12, 45, 0, 0))),
    createMessage("49", "bob@example.com", "On my way!", undefined, new Date(now.setHours(12, 50, 0, 0))),
    createMessage("50", "alice@example.com", "See you there!", undefined, new Date(now.setHours(12, 55, 0, 0))),
    createMessage("51", "alice@example.com", "See you there!", undefined, new Date(now.setHours(12, 55, 0, 0))),
  ];
};

let mockData: Message[] = generateMockMessages();

const sortedMockData = [...mockData].sort(
  (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
);

const MESSAGES_PER_PAGE = 10;

export const useMessages = () => {
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [oldestLoadedIndex, setOldestLoadedIndex] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const loadInitialMessages = useCallback(async () => {
    setIsInitialLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const total = sortedMockData.length;
      const startIndex = Math.max(0, total - MESSAGES_PER_PAGE);
      const initialMessages = sortedMockData.slice(startIndex);

      setAllMessages(initialMessages);
      setOldestLoadedIndex(startIndex);
      setHasMore(startIndex > 0);
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
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newStartIndex = Math.max(0, oldestLoadedIndex - MESSAGES_PER_PAGE);
      const olderMessages = sortedMockData.slice(
        newStartIndex,
        oldestLoadedIndex
      );

      setAllMessages((prev) => [...olderMessages, ...prev]);
      setOldestLoadedIndex(newStartIndex);
      setHasMore(newStartIndex > 0);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to load more messages");
      setError(error);
      console.error("Error loading more messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [oldestLoadedIndex, hasMore, isLoadingMore]);

  const appendMessage = useCallback(
    (message: Message) => {
      setAllMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
      const total = sortedMockData.length;
      const lastIndex = sortedMockData.length - 1;
      if (oldestLoadedIndex >= lastIndex - MESSAGES_PER_PAGE) {
        setOldestLoadedIndex(Math.max(0, total - MESSAGES_PER_PAGE));
      }
    },
    [oldestLoadedIndex]
  );

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
  const { user } = useUser();

  const sendMessage = async (newMessage: {
    content?: string;
    media?: string;
  }): Promise<Message> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!user) {
      throw new Error("User not authenticated");
    }

    const message: Message = {
      id: Date.now().toString(),
      user: {
        email: user.email,
        name: user.name,
      },
      content: newMessage.content,
      media: newMessage.media,
      timestamp: new Date(),
    };

    mockData = [...mockData, message];
    sortedMockData.push(message);
    sortedMockData.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

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
