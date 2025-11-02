import { Box, AppBar, Toolbar, Typography } from "@mui/material";
import { ChatWindow } from "@/components/ChatWindow";
import { MessageInput } from "@/components//MessageInput";
import { useMessages, useSendMessage } from "@/hooks/useMessages";
import { useUser } from "@/hooks/useUser";

export const Chat = () => {
  const { data: messages = [], isLoading, error } = useMessages();
  const { mutate: sendMessage, isPending } = useSendMessage();
  const { user } = useUser();

  const handleSendMessage = (newMessage: {
    content: string;
    media?: string;
  }) => {
    sendMessage(newMessage);
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Group Chat
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {user.name}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          error={error}
          currentUserEmail={user.email}
        />
      </Box>

      <MessageInput onSend={handleSendMessage} isPending={isPending} />
    </Box>
  );
};
