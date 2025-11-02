import { ThemeProvider, CssBaseline } from "@mui/material";
import { QueryProvider } from "@/providers/QueryProvider";
import { useTheme } from "@/hooks/useTheme";
import { useUser } from "@/hooks/useUser";
import { Chat } from "@/components/Chat";
import { LoginDialog } from "@/components/LoginDialog";
import { useState, useEffect } from "react";
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

  const handleLoginSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    setShowLoginDialog(false);
  };

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
