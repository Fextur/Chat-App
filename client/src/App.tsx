import { ThemeProvider, CssBaseline } from "@mui/material";
import { QueryProvider } from "@/providers/QueryProvider";
import { useTheme } from "@/hooks/ui/useTheme";
import { useUser } from "@/hooks/auth/useUser";
import { Chat } from "@/components/chat/Chat";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

function AppContent() {
  const { isAuthenticated, isLoading } = useUser();
  const queryClient = useQueryClient();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowLoginDialog(true);
    } else if (isAuthenticated) {
      setShowLoginDialog(false);
    }
  }, [isAuthenticated, isLoading]);

  const handleLoginSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    setShowLoginDialog(false);
  }, [queryClient]);

  return (
    <>
      {isAuthenticated ? (
        <Chat />
      ) : (
        <LoginDialog open={showLoginDialog} onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}

function App() {
  const theme = useTheme();

  return (
    <QueryProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </QueryProvider>
  );
}

export default App;
