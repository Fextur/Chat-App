import { ThemeProvider, CssBaseline } from "@mui/material";
import { QueryProvider } from "@/providers/QueryProvider";
import { useTheme } from "@/hooks/useTheme";
import { Chat } from "@/components/Chat";

function App() {
  const theme = useTheme();

  return (
    <QueryProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Chat />
      </ThemeProvider>
    </QueryProvider>
  );
}

export default App;
