export const useSendMessage = () => {
  return {
    mutate: (message: { content: string; media?: string }) => {
      console.log("Sending message (stub):", message);
    },
    isPending: false,
  };
};
