import { useState, useRef, ChangeEvent, KeyboardEvent } from "react";
import { Box, TextField, IconButton, Paper, Tooltip } from "@mui/material";
import { Send, ImagePlus, X } from "lucide-react";

const MAX_MESSAGE_LENGTH = 200;

interface MessageInputProps {
  onSend: (message: { content?: string; media?: string }) => void;
  isPending?: boolean;
}

export const MessageInput = ({
  onSend,
  isPending = false,
}: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (
      (message.trim() || mediaPreview) &&
      message.length <= MAX_MESSAGE_LENGTH
    ) {
      onSend({
        content: message.trim() || undefined,
        media: mediaPreview || undefined,
      });
      setMessage("");
      setMediaPreview(null);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
      {mediaPreview && (
        <Box
          sx={{
            mb: 2,
            position: "relative",
            display: "inline-block",
          }}
        >
          <Box
            component="img"
            src={mediaPreview}
            alt="Preview"
            sx={{
              maxWidth: 200,
              maxHeight: 150,
              borderRadius: 2,
              objectFit: "cover",
            }}
          />
          <IconButton
            size="small"
            onClick={handleRemoveImage}
            sx={{
              position: "absolute",
              top: -8,
              right: -8,
              backgroundColor: "error.main",
              color: "white",
              "&:hover": {
                backgroundColor: "error.dark",
              },
            }}
          >
            <X size={16} />
          </IconButton>
        </Box>
      )}

      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageSelect}
        />
        <Tooltip title="Add image">
          <IconButton
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
            sx={{
              color: "primary.main",
            }}
          >
            <ImagePlus size={24} />
          </IconButton>
        </Tooltip>

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
          disabled={
            (!message.trim() && !mediaPreview) || isOverLimit || isPending
          }
          sx={{
            backgroundColor: "primary.main",
            color: "white",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
            "&.Mui-disabled": {
              backgroundColor: "action.disabledBackground",
              color: "action.disabled",
            },
            height: 40,
            width: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Send size={20} />
        </IconButton>
      </Box>
    </Paper>
  );
};
