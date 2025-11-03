import { useCallback } from "react";
import { Box, AppBar, Toolbar, Typography, Button } from "@mui/material";
import { ChatWindow } from "@/components/ChatWindow";
import { MessageInput } from "@/components/MessageInput";
import { useMessages } from "@/hooks/useMessages";
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
  const { user } = useUser();
  const queryClient = useQueryClient();

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      window.location.reload();
    } catch {}
  }, [queryClient]);

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
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          backdropFilter: "blur(20px)",
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 56, sm: 64 },
            px: { xs: 2, sm: 3 },
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 600,
              fontSize: { xs: "1.125rem", sm: "1.25rem" },
              color: "text.primary",
              letterSpacing: "-0.01em",
            }}
          >
            Group Chat
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              mr: 2,
              fontSize: { xs: "0.8125rem", sm: "0.875rem" },
              display: { xs: "none", sm: "block" },
            }}
          >
            {user?.name}
          </Typography>
          <Button
            onClick={handleLogout}
            sx={{
              textTransform: "none",
              color: "text.secondary",
              fontWeight: 500,
              borderRadius: 2,
              px: 1.5,
              py: 0.75,
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
                color: "text.primary",
              },
              fontSize: { xs: "0.8125rem", sm: "0.875rem" },
            }}
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

      {user && <MessageInput />}
    </Box>
  );
};
