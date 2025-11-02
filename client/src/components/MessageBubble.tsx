import { Box, Typography, Paper } from "@mui/material";
import { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

export const MessageBubble = ({
  message,
  isCurrentUser,
}: MessageBubbleProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isCurrentUser ? "flex-end" : "flex-start",
        mb: 2,
        px: 2,
      }}
    >
      <Box sx={{ maxWidth: "70%", minWidth: "120px" }}>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            mb: 0.5,
            display: "block",
            px: 1,
            textAlign: isCurrentUser ? "right" : "left",
          }}
        >
          {message.user}
        </Typography>

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
  );
};
