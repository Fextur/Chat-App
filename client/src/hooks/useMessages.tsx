import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/hooks/useUser";
import { Message } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const generateMockMessages = (): Message[] => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  return [
    {
      id: "1",
      user: "john@example.com",
      content: "Hey everyone! Hows it going?",
      timestamp: new Date(twoDaysAgo.setHours(9, 0, 0, 0)),
    },
    {
      id: "2",
      user: "jane@example.com",
      content: "Hi John! Im doing great, thanks for asking!",
      timestamp: new Date(twoDaysAgo.setHours(9, 5, 0, 0)),
    },
    {
      id: "3",
      user: "bob@example.com",
      content: "Good morning everyone! 🌞",
      timestamp: new Date(twoDaysAgo.setHours(9, 10, 0, 0)),
    },
    {
      id: "4",
      user: "alice@example.com",
      content: "Check out this amazing sunset I captured!",
      media:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      timestamp: new Date(twoDaysAgo.setHours(14, 30, 0, 0)),
    },
    {
      id: "4a",
      user: "jane@example.com",
      media:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop",
      timestamp: new Date(twoDaysAgo.setHours(14, 32, 0, 0)),
    },
    {
      id: "5",
      user: "john@example.com",
      content: "Wow, thats beautiful! Where was this taken?",
      timestamp: new Date(twoDaysAgo.setHours(14, 35, 0, 0)),
    },
    {
      id: "6",
      user: "alice@example.com",
      content: "Thanks! It was at the beach near Santa Monica",
      timestamp: new Date(twoDaysAgo.setHours(14, 40, 0, 0)),
    },
    {
      id: "7",
      user: "jane@example.com",
      content: "Good evening! Anyone up for a movie tonight?",
      timestamp: new Date(twoDaysAgo.setHours(18, 0, 0, 0)),
    },
    {
      id: "8",
      user: "bob@example.com",
      content: "Im in! What movie are we watching?",
      timestamp: new Date(twoDaysAgo.setHours(18, 5, 0, 0)),
    },
    {
      id: "9",
      user: "john@example.com",
      content: "Good morning team!",
      timestamp: new Date(yesterday.setHours(8, 0, 0, 0)),
    },
    {
      id: "10",
      user: "alice@example.com",
      content: "Morning John! Ready for the presentation?",
      timestamp: new Date(yesterday.setHours(8, 15, 0, 0)),
    },
    {
      id: "11",
      user: "jane@example.com",
      content: "I have some ideas Id like to share",
      timestamp: new Date(yesterday.setHours(10, 30, 0, 0)),
    },
    {
      id: "12",
      user: "bob@example.com",
      content: "Lets hear them!",
      timestamp: new Date(yesterday.setHours(10, 35, 0, 0)),
    },
    {
      id: "13",
      user: "alice@example.com",
      content: "Heres the mockup Ive been working on",
      media: "https://static.thenounproject.com/png/4778723-200.png",
      timestamp: new Date(yesterday.setHours(13, 20, 0, 0)),
    },
    {
      id: "13a",
      user: "bob@example.com",
      media:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
      timestamp: new Date(yesterday.setHours(13, 22, 0, 0)),
    },
    {
      id: "14",
      user: "john@example.com",
      content: "This looks fantastic! Great work!",
      timestamp: new Date(yesterday.setHours(13, 25, 0, 0)),
    },
    {
      id: "15",
      user: "jane@example.com",
      content: "I agree! The colors really pop",
      timestamp: new Date(yesterday.setHours(13, 30, 0, 0)),
    },
    {
      id: "16",
      user: "bob@example.com",
      content: "Should we schedule a meeting to discuss implementation?",
      timestamp: new Date(yesterday.setHours(15, 0, 0, 0)),
    },
    {
      id: "17",
      user: "alice@example.com",
      content: "Yes, Im free tomorrow afternoon",
      timestamp: new Date(yesterday.setHours(15, 10, 0, 0)),
    },
    {
      id: "18",
      user: "jane@example.com",
      content: "Good morning everyone! ☀️",
      timestamp: new Date(now.setHours(7, 30, 0, 0)),
    },
    {
      id: "19",
      user: "john@example.com",
      content: "Morning! Ready for another productive day",
      timestamp: new Date(now.setHours(8, 0, 0, 0)),
    },
    {
      id: "20",
      user: "bob@example.com",
      content: "Hey everyone!",
      timestamp: new Date(now.setHours(8, 15, 0, 0)),
    },
    {
      id: "21",
      user: "alice@example.com",
      content: "Just finished my coffee ☕",
      timestamp: new Date(now.setHours(9, 0, 0, 0)),
    },
    {
      id: "21a",
      user: "john@example.com",
      media:
        "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop",
      timestamp: new Date(now.setHours(9, 5, 0, 0)),
    },
    {
      id: "22",
      user: "jane@example.com",
      content: "Anyone need help with anything today?",
      timestamp: new Date(now.setHours(9, 30, 0, 0)),
    },
    {
      id: "23",
      user: "john@example.com",
      content: "I could use some feedback on the new feature",
      timestamp: new Date(now.setHours(10, 0, 0, 0)),
    },
    {
      id: "24",
      user: "bob@example.com",
      content: "Sure! Send it over",
      timestamp: new Date(now.setHours(10, 5, 0, 0)),
    },
    {
      id: "25",
      user: "alice@example.com",
      content: "Im happy to review it as well",
      timestamp: new Date(now.setHours(10, 10, 0, 0)),
    },
    {
      id: "26",
      user: "jane@example.com",
      content: "Team lunch at noon?",
      timestamp: new Date(now.setHours(11, 0, 0, 0)),
    },
    {
      id: "27",
      user: "john@example.com",
      content: "Count me in!",
      timestamp: new Date(now.setHours(11, 2, 0, 0)),
    },
    {
      id: "28",
      user: "bob@example.com",
      content: "Sounds good to me",
      timestamp: new Date(now.setHours(11, 5, 0, 0)),
    },
    {
      id: "29",
      user: "alice@example.com",
      content: "Perfect! See you all then 🍕",
      timestamp: new Date(now.setHours(11, 10, 0, 0)),
    },
    {
      id: "30",
      user: "you@example.com",
      content: "Looking forward to it!",
      timestamp: new Date(now.setHours(11, 15, 0, 0)),
    },
    {
      id: "31",
      user: "john@example.com",
      content: "Great! See you all at noon then",
      timestamp: new Date(now.setHours(11, 20, 0, 0)),
    },
    {
      id: "32",
      user: "jane@example.com",
      content: "Perfect timing!",
      timestamp: new Date(now.setHours(11, 25, 0, 0)),
    },
    {
      id: "33",
      user: "bob@example.com",
      content: "Looking forward to catching up with everyone",
      timestamp: new Date(now.setHours(11, 30, 0, 0)),
    },
    {
      id: "34",
      user: "alice@example.com",
      content: "Me too! It's been a while since we all got together",
      timestamp: new Date(now.setHours(11, 35, 0, 0)),
    },
    {
      id: "35",
      user: "john@example.com",
      content: "Absolutely! We should do this more often",
      timestamp: new Date(now.setHours(11, 40, 0, 0)),
    },
    {
      id: "36",
      user: "jane@example.com",
      content: "Agreed! Team building is important",
      timestamp: new Date(now.setHours(11, 45, 0, 0)),
    },
    {
      id: "37",
      user: "bob@example.com",
      content: "Couldn't agree more!",
      timestamp: new Date(now.setHours(11, 50, 0, 0)),
    },
    {
      id: "38",
      user: "alice@example.com",
      content: "Well said, Bob!",
      timestamp: new Date(now.setHours(11, 55, 0, 0)),
    },
    {
      id: "39",
      user: "john@example.com",
      content:
        "Quick question before we break - anyone have updates on the project?",
      timestamp: new Date(now.setHours(12, 0, 0, 0)),
    },
    {
      id: "40",
      user: "jane@example.com",
      content: "Yes! I finished the frontend work yesterday",
      timestamp: new Date(now.setHours(12, 5, 0, 0)),
    },
    {
      id: "41",
      user: "bob@example.com",
      content: "Backend is 90% done, should finish today",
      timestamp: new Date(now.setHours(12, 10, 0, 0)),
    },
    {
      id: "42",
      user: "alice@example.com",
      content: "Design mockups are ready for review",
      timestamp: new Date(now.setHours(12, 15, 0, 0)),
    },
    {
      id: "43",
      user: "john@example.com",
      content: "Excellent progress everyone! 🎉",
      timestamp: new Date(now.setHours(12, 20, 0, 0)),
    },
    {
      id: "44",
      user: "bob@example.com",
      content: "Thanks John! Really excited about this project",
      timestamp: new Date(now.setHours(12, 25, 0, 0)),
    },
    {
      id: "45",
      user: "bob@example.com",
      content: "Same here! Can't wait to see it live",
      timestamp: new Date(now.setHours(12, 30, 0, 0)),
    },
    {
      id: "46",
      user: "alice@example.com",
      content: "The team has been doing amazing work!",
      timestamp: new Date(now.setHours(12, 35, 0, 0)),
    },
    {
      id: "47",
      user: "bob@example.com",
      content: "Couldn't have said it better myself",
      timestamp: new Date(now.setHours(12, 40, 0, 0)),
    },
    {
      id: "48",
      user: "bob@example.com",
      content: "Alright, time for lunch! 🍽️",
      timestamp: new Date(now.setHours(12, 45, 0, 0)),
    },
    {
      id: "49",
      user: "bob@example.com",
      content: "On my way!",
      timestamp: new Date(now.setHours(12, 50, 0, 0)),
    },
    {
      id: "50",
      user: "alice@example.com",
      content: "See you there!",
      timestamp: new Date(now.setHours(12, 55, 0, 0)),
    },
    {
      id: "51",
      user: "alice@example.com",
      content: "See you there!",
      timestamp: new Date(now.setHours(12, 55, 0, 0)),
    },
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

  useEffect(() => {
    const loadInitialMessages = async () => {
      setIsInitialLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const total = sortedMockData.length;
      const startIndex = Math.max(0, total - MESSAGES_PER_PAGE);
      const initialMessages = sortedMockData.slice(startIndex);

      setAllMessages(initialMessages);
      setOldestLoadedIndex(startIndex);
      setHasMore(startIndex > 0);
      setIsInitialLoading(false);
    };

    loadInitialMessages();
  }, []);

  const loadMoreMessages = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
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
    error: null,
    hasMore,
    isLoadingMore,
    loadMoreMessages,
    appendMessage,
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

    const message: Message = {
      id: Date.now().toString(),
      user: user.email,
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
