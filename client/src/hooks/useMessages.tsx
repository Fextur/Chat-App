import { useUser } from "@/hooks/useUser";
import { Message } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
    // Yesterday's messages
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
      media:
        "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop",
      timestamp: new Date(yesterday.setHours(13, 20, 0, 0)),
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
    // Today's messages
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
  ];
};

let mockData: Message[] = generateMockMessages();

const fetchMessages = async (): Promise<Message[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockData;
};

export const useMessages = () => {
  return useQuery({
    queryKey: ["messages"],
    queryFn: fetchMessages,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useUser();

  const sendMessage = async (newMessage: {
    content: string;
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
    return message;
  };
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
};
