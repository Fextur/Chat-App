import { Box, AppBar, Toolbar, Typography, Button } from "@mui/material";
import { ChatWindow } from "@/components/ChatWindow";
import { MessageInput } from "@/components/MessageInput";
import { useMessages } from "@/hooks/useMessages";
import { useSendMessage } from "@/hooks/useSendMessage";
import { useUser } from "@/hooks/useUser";
import { authService } from "@/services/auth.service";
import { useQueryClient } from "@tanstack/react-query";

export const Chat = () => {
  const {
    data: messages = [],
    isLoading,
    error,
    hasMore,
    isLoadingMore,
    loadMoreMessages,
    retry,
  } = useMessages();
  const { mutate: sendMessage, isPending } = useSendMessage();
  const { user } = useUser();
  const queryClient = useQueryClient();

  const handleSendMessage = (newMessage: {
    content?: string;
    media?: string;
  }) => {
    sendMessage(newMessage);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
    }
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
          <Typography variant="body2" sx={{ opacity: 0.8, mr: 2 }}>
            {user?.name}
          </Typography>
          <Button
            color="inherit"
            onClick={handleLogout}
            sx={{ textTransform: "none" }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
        {user && (
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            error={error}
            currentUserEmail={user.email}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadMoreMessages}
            onRetry={retry}
          />
        )}
      </Box>

      {user && (
        <MessageInput onSend={handleSendMessage} isPending={isPending} />
      )}
    </Box>
  );
};
