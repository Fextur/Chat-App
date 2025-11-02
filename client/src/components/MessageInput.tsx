import { useState } from "react";
import { Box, TextField, IconButton, Paper } from "@mui/material";
import { Send } from "lucide-react";

const MAX_MESSAGE_LENGTH = 200;

interface MessageInputProps {
  onSend: (message: { content: string; media?: string }) => void;
  isPending?: boolean;
}

export const MessageInput = ({
  onSend,
  isPending = false,
}: MessageInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && message.length <= MAX_MESSAGE_LENGTH) {
      onSend({ content: message.trim() });
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const remaining = MAX_MESSAGE_LENGTH - message.length;
  const isOverLimit = remaining < 0;

  return (
    <Paper
      elevation={3}
      sx={{
        position: "sticky",
        bottom: 0,
        backgroundColor: "background.paper",
        borderTop: 1,
        borderColor: "divider",
        p: 2,
      }}
    >
      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isPending}
          error={isOverLimit}
          helperText={
            remaining <= 20
              ? `${remaining} characters ${
                  isOverLimit ? "over limit" : "remaining"
                }`
              : ""
          }
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
            },
          }}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={!message.trim() || isOverLimit || isPending}
          sx={{
            backgroundColor: "primary.main",
            color: "white",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
            "&.Mui-disabled": {
              backgroundColor: "action.disabledBackground",
            },
            mb: 2.5,
          }}
        >
          <Send size={20} />
        </IconButton>
      </Box>
    </Paper>
  );
};
