import {
  useMutation,
  useQueryClient,
  InfiniteData,
} from "@tanstack/react-query";
import { messagesService } from "@/services/messages.service";
import { Message } from "@/types";
import { useUser } from "./useUser";

const MESSAGES_QUERY_KEY = ["messages"];

type MessagesQueryData = InfiniteData<{
  messages: Message[];
  hasMore: boolean;
  oldestMessageId?: string;
}>;

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: (newMessage: { content?: string; media?: string }) =>
      messagesService.createMessage(newMessage),
    onSuccess: (message) => {
      if (user && message.user.email === user.email) {
        queryClient.setQueryData<MessagesQueryData>(
          MESSAGES_QUERY_KEY,
          (oldData) => {
            if (!oldData) {
              return {
                pages: [{ messages: [message], hasMore: false }],
                pageParams: [undefined],
              };
            }

            const messageExists = oldData.pages.some((page) =>
              page.messages.some((m) => m.id === message.id)
            );

            if (messageExists) {
              return oldData;
            }

            const firstPage = oldData.pages[0];
            return {
              ...oldData,
              pages: [
                {
                  ...firstPage,
                  messages: [...firstPage.messages, message],
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        );
      }
    },
  });
};
