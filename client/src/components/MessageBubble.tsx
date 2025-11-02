import { Box, Typography, Paper } from "@mui/material";
import { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  showDateHeader?: boolean;
}

export const MessageBubble = ({
  message,
  isCurrentUser,
  showDateHeader = false,
}: MessageBubbleProps) => {
  const formatDateHeader = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const messageDate = new Date(date);
    messageDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);

    if (messageDate.getTime() === today.getTime()) {
      return "Today";
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };
  return (
    <>
      {showDateHeader && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "58px",
            my: 0,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              backgroundColor: "rgba(0, 0, 0, 0.08)",
              color: "text.secondary",
              px: 2,
              py: 0.5,
              borderRadius: 2,
              fontSize: "0.75rem",
              fontWeight: 500,
            }}
          >
            {formatDateHeader(message.timestamp)}
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: isCurrentUser ? "flex-end" : "flex-start",
          mb: 2,
          px: 2,
        }}
      >
        <Box sx={{ maxWidth: "70%", minWidth: "120px" }}>
          {!isCurrentUser && (
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                mb: 0.5,
                display: "block",
                px: 1,
                textAlign: "left",
              }}
            >
              {message.user}
            </Typography>
          )}

          <Paper
            elevation={1}
            sx={{
              p: 1.5,
              backgroundColor: isCurrentUser ? "#0084ff" : "#f0f0f0",
              color: isCurrentUser ? "white" : "text.primary",
              borderRadius: 2.5,
              wordWrap: "break-word",
              overflowWrap: "break-word",
            }}
          >
            {message.media && (
              <Box
                component="img"
                src={message.media}
                alt="Shared image"
                sx={{
                  width: "100%",
                  maxHeight: 300,
                  objectFit: "cover",
                  borderRadius: 1.5,
                  mb: message.content ? 1 : 0,
                }}
              />
            )}

            {message.content && (
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {message.content}
              </Typography>
            )}

            <Typography
              variant="caption"
              sx={{
                display: "block",
                mt: 0.5,
                opacity: 0.7,
                fontSize: "0.7rem",
              }}
            >
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
          </Paper>
        </Box>
      </Box>
    </>
  );
};
