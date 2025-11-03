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
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/config/firebase";
import { authService } from "@/services/auth.service";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface LoginDialogProps {
  open: boolean;
  onLoginSuccess: () => void;
}

export const LoginDialog = ({ open, onLoginSuccess }: LoginDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      await authService.login(idToken);
      await queryClient.refetchQueries({ queryKey: ["auth", "me"] });
      onLoginSuccess();
    } catch (err: any) {
      if (
        err.code === "auth/popup-closed-by-user" ||
        err.code === "auth/cancelled-popup-request"
      ) {
        setError(null);
      } else {
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to sign in. Please try again.";
        setError(errorMessage);
      }
    } finally {
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
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" thickness={4} />
            ) : null
          }
          sx={{
            py: 1.5,
            borderRadius: 2.5,
            textTransform: "none",
            fontSize: "0.9375rem",
            fontWeight: 500,
            boxShadow: "0 4px 12px rgba(0, 122, 255, 0.25)",
            "&:hover": {
              boxShadow: "0 6px 16px rgba(0, 122, 255, 0.3)",
              transform: "translateY(-1px)",
            },
            transition: "all 0.2s ease",
          }}
        >
          {loading ? "Signing in..." : "Sign in with Google"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
