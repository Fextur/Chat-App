import { Box, Typography, Button } from "@mui/material";

interface ChatWindowErrorProps {
  error: any;
  onRetry?: () => void;
  isLoading?: boolean;
  hasMessages?: boolean;
}

export const ChatWindowError = ({
  error,
  onRetry,
  isLoading,
  hasMessages = false,
}: ChatWindowErrorProps) => {
  if (hasMessages) {
    return (
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 1.5,
          zIndex: 1,
          backgroundColor: "rgba(211, 47, 47, 0.08)",
          backdropFilter: "blur(10px)",
          gap: 1.5,
          borderRadius: "0 0 12px 12px",
        }}
      >
        <Typography color="error" variant="body2" sx={{ fontSize: "0.8125rem" }}>
          {error?.message || "Failed to load more messages"}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={onRetry}
          disabled={isLoading}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            minWidth: "auto",
            px: 1.5,
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        gap: 2,
        px: 2,
      }}
    >
      <Typography
        color="error"
        variant="body1"
        sx={{
          fontSize: "0.9375rem",
          textAlign: "center",
        }}
      >
        {error?.message || "Failed to load messages"}
      </Typography>
      {onRetry && (
        <Button
          variant="contained"
          onClick={onRetry}
          disabled={isLoading}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            px: 2,
            py: 1,
          }}
        >
          Retry
        </Button>
      )}
    </Box>
  );
};

