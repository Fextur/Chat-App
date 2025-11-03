import { Box, Typography, Paper } from "@mui/material";
import { Message } from "@/types";
import { getUserColor } from "@/utils/colorUtils";

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
  const userColor = isCurrentUser ? null : getUserColor(message.user.email);

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
              backgroundColor: "rgba(0, 0, 0, 0.06)",
              color: "text.secondary",
              px: 2.5,
              py: 0.75,
              borderRadius: 10,
              fontSize: "0.75rem",
              fontWeight: 500,
              letterSpacing: "0.01em",
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
          mb: 1.5,
          px: { xs: 1.5, sm: 2 },
        }}
      >
        <Box sx={{ maxWidth: { xs: "85%", sm: "70%" }, minWidth: "120px" }}>
          {!isCurrentUser && (
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                mb: 0.75,
                display: "block",
                px: 1.5,
                textAlign: "left",
                fontSize: "0.75rem",
                fontWeight: 500,
                letterSpacing: "0.01em",
              }}
            >
              {message.user.name}
            </Typography>
          )}

          <Paper
            elevation={0}
            sx={{
              p: 1.75,
              backgroundColor: isCurrentUser
                ? "primary.main"
                : userColor?.background || "#F5F5F7",
              color: isCurrentUser
                ? "white"
                : userColor?.textColor || "text.primary",
              borderRadius: isCurrentUser
                ? "18px 18px 4px 18px"
                : "18px 18px 18px 4px",
              wordWrap: "break-word",
              overflowWrap: "break-word",
              boxShadow: isCurrentUser
                ? "0 2px 4px rgba(0, 122, 255, 0.15)"
                : "0 1px 2px rgba(0, 0, 0, 0.04)",
              transition: "box-shadow 0.2s ease",
            }}
          >
            {message.media && (
              <Box
                component="img"
                src={message.media}
                alt="Shared image"
                loading="lazy"
                onLoad={(e) => {
                  const img = e.currentTarget;
                  if (img.naturalHeight > 0) {
                    requestAnimationFrame(() => {
                      const container = img.closest(
                        "[data-index]"
                      ) as HTMLElement;
                      if (container) {
                        const event = new CustomEvent("imageLoaded");
                        container.dispatchEvent(event);
                      }
                    });
                  }
                }}
                sx={{
                  maxHeight: 300,
                  maxWidth: "100%",
                  width: "auto",
                  height: "auto",
                  objectFit: "cover",
                  borderRadius: 2,
                  mb: message.content ? 1.25 : 0,
                  display: "block",
                }}
              />
            )}

            {message.content && (
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  lineHeight: 1.5,
                  fontSize: "0.9375rem",
                  mb: message.media ? 0 : 0,
                }}
              >
                {message.content}
              </Typography>
            )}

            <Typography
              variant="caption"
              sx={{
                display: "block",
                mt: 0.75,
                opacity: isCurrentUser ? 0.85 : 0.65,
                fontSize: "0.6875rem",
                fontWeight: 400,
                letterSpacing: "0.01em",
                textAlign: "right",
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
