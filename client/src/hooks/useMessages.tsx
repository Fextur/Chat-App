import { useQuery } from "@tanstack/react-query";
import { Message } from "@/types";

// TODO
const generateStubMessages = (): Message[] => {
  const users = [
    "alice@example.com",
    "bob@example.com",
    "charlie@example.com",
    "diana@example.com",
  ];

  const sampleMessages = [
    "Hey everyone! How are you doing?",
    "Just finished the project review meeting",
    "Anyone up for lunch?",
    "Check out this cool article I found",
    "The weather is amazing today! ☀️",
    "Can someone help me with the deployment?",
    "Great job on the presentation!",
    "Let's schedule a call for tomorrow",
    "I'll be working from home today",
    "Thanks for the feedback!",
    "This is a longer message to test how the UI handles multi-line content. Sometimes people write longer messages that need to wrap properly in the chat interface.",
    "Quick question about the API",
    "Meeting starts in 10 minutes",
    "Coffee break? ☕",
    "Perfect, let me know when you're ready",
  ];

  const images = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400",
  ];

  const messages: Message[] = [];
  const now = new Date();

  for (let i = 0; i < 30; i++) {
    const hasMedia = Math.random() > 0.8;

    messages.push({
      id: `msg-${i}`,
      user: users[Math.floor(Math.random() * users.length)],
      content:
        sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
      media: hasMedia
        ? images[Math.floor(Math.random() * images.length)]
        : undefined,
      timestamp: new Date(now.getTime() - (30 - i) * 60000),
    });
  }

  return messages;
};

const stubMessages = generateStubMessages();

export const useMessages = () => {
  return useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return stubMessages;
    },
    staleTime: Infinity,
  });
};
