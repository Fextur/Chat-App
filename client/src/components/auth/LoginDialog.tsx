import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Stack,
  Alert,
} from "@mui/material";
import { signInWithRedirect } from "firebase/auth";
import { auth, googleProvider } from "@/config/firebase";
import { useState } from "react";

interface LoginDialogProps {
  open: boolean;
  onLoginSuccess: () => void;
}

export const LoginDialog = ({ open }: LoginDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to sign in. Please try again.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontSize: { xs: "1.5rem", sm: "1.75rem" },
          fontWeight: 600,
          pt: 4,
          pb: 2,
          color: "text.primary",
          letterSpacing: "-0.01em",
        }}
      >
        Welcome to Group Chat
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ py: 2 }}>
          <Typography
            variant="body1"
            sx={{
              textAlign: "center",
              color: "text.secondary",
              px: 2,
              fontSize: "0.9375rem",
              lineHeight: 1.5,
            }}
          >
            Sign in with your Google account to start chatting
          </Typography>
          {error && (
            <Alert
              severity="error"
              sx={{
                borderRadius: 2,
                fontSize: "0.875rem",
              }}
            >
              {error}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 4 }}>
        <Button
          onClick={handleGoogleLogin}
          disabled={loading}
          variant="contained"
          fullWidth
          size="large"
          startIcon={loading ? <CircularProgress size={20} /> : null}
          sx={{
            py: 1.5,
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 500,
          }}
        >
          {loading ? "Signing in..." : "Sign in with Google"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
