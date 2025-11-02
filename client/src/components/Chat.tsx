import { Box, AppBar, Toolbar, Typography } from "@mui/material";
import { MessagesSquare } from "lucide-react";
import { ChatWindow } from "@/components/ChatWindow";
import { MessageInput } from "@/components//MessageInput";
import { useMessages } from "@/hooks/useMessages";
import { useSendMessage } from "@/hooks/useSendMessage";
import { useUser } from "@/hooks/useUser";

export const Chat = () => {
  const { data: messages = [], isLoading, error } = useMessages();
  const { mutate: sendMessage, isPending } = useSendMessage();
  const { user } = useUser();

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.default",
      }}
    >
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <MessagesSquare size={24} style={{ marginRight: 12 }} />
          <Typography variant="h6" component="div">
            Global Chat Room
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          error={error}
          currentUserEmail={user.email}
        />
      </Box>

      <MessageInput onSend={sendMessage} isPending={isPending} />
    </Box>
  );
};
