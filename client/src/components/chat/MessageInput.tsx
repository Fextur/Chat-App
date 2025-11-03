import {
  useState,
  useRef,
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { Send, ImagePlus, Sparkles } from "lucide-react";
import { useAIAssistance } from "@/hooks/chat/useAIAssistance";
import { useSendMessage } from "@/hooks/chat/useSendMessage";
import { useDragAndDrop } from "@/hooks/chat/useDragAndDrop";
import { ImagePreview } from "@/components/ui/ImagePreview";

const MAX_MESSAGE_LENGTH = 200;

export const MessageInput = () => {
  const [message, setMessage] = useState("");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aiAssistanceMutation = useAIAssistance();
  const sendMessageMutation = useSendMessage();

  useEffect(() => {
    if (aiAssistanceMutation.error) {
      const errorMessage =
        (aiAssistanceMutation.error as any)?.response?.data?.message ||
        (aiAssistanceMutation.error as any)?.message ||
        "Failed to get AI assistance. Please try again.";
      setError(errorMessage);
    }
  }, [aiAssistanceMutation.error]);

  useEffect(() => {
    if (sendMessageMutation.error) {
      const errorMessage =
        (sendMessageMutation.error as any)?.response?.data?.message ||
        (sendMessageMutation.error as any)?.message ||
        "Failed to send message. Please try again.";
      setError(errorMessage);
    }
  }, [sendMessageMutation.error]);

  useEffect(() => {
    if (sendMessageMutation.isSuccess) {
      setMessage("");
      setMediaPreview(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [sendMessageMutation.isSuccess]);

  const handleSend = useCallback(() => {
    if (
      (message.trim() || selectedFile) &&
      message.length <= MAX_MESSAGE_LENGTH &&
      !sendMessageMutation.isPending
    ) {
      sendMessageMutation.mutate({
        content: message.trim() || undefined,
        file: selectedFile || undefined,
      });
    }
  }, [message, selectedFile, sendMessageMutation]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const processImageFile = useCallback((file: File) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleImageSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processImageFile(file);
      }
    },
    [processImageFile]
  );

  const handleRemoveImage = useCallback(() => {
    setMediaPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const { isDragging, dragHandlers } = useDragAndDrop({
    onFileSelected: processImageFile,
    disabled: sendMessageMutation.isPending,
  });

  const remaining = useMemo(
    () => MAX_MESSAGE_LENGTH - message.length,
    [message.length]
  );
  const isOverLimit = useMemo(() => remaining < 0, [remaining]);
  const hasContent = useMemo(
    () => message.trim() || selectedFile,
    [message, selectedFile]
  );
  const canShowAIAssistance = useMemo(
    () => !hasContent && !sendMessageMutation.isPending,
    [hasContent, sendMessageMutation.isPending]
  );

  return (
    <>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Paper
        elevation={0}
        {...dragHandlers}
        sx={{
          position: "sticky",
          bottom: 0,
          backgroundColor: isDragging
            ? "rgba(0, 122, 255, 0.04)"
            : "background.paper",
          borderTop: `1px solid ${
            isDragging ? "primary.main" : "rgba(0, 0, 0, 0.08)"
          }`,
          borderWidth: isDragging ? "2px 0 0 0" : "1px 0 0 0",
          borderStyle: "solid",
          p: { xs: 1.5, sm: 2 },
          transition: "all 0.2s ease-in-out",
          backdropFilter: "blur(20px)",
          borderRadius: 0,
        }}
      >
        {mediaPreview && (
          <ImagePreview src={mediaPreview} onRemove={handleRemoveImage} />
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
              disabled={sendMessageMutation.isPending}
              sx={{
                color: "text.secondary",
                flexShrink: 0,
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                  color: "primary.main",
                },
                transition: "all 0.2s ease",
              }}
            >
              <ImagePlus size={22} />
            </IconButton>
          </Tooltip>

          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type a message…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sendMessageMutation.isPending}
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
                borderRadius: 2.5,
                fontSize: "0.9375rem",
                alignItems: "center",
                "&.Mui-focused": {
                  backgroundColor: "background.paper",
                },
              },
              "& .MuiInputBase-input": {
                alignSelf: "center",
              },
              "& .MuiFormHelperText-root": {
                fontSize: "0.6875rem",
                marginLeft: 0,
                marginTop: 0.5,
              },
            }}
          />

          {canShowAIAssistance ? (
            <Tooltip title="Get AI assistance">
              <IconButton
                color="secondary"
                onClick={() => aiAssistanceMutation.mutate()}
                disabled={aiAssistanceMutation.isPending}
                sx={{
                  backgroundColor: "secondary.main",
                  color: "white",
                  flexShrink: 0,
                  "&:hover": {
                    backgroundColor: "secondary.dark",
                    transform: "scale(1.05)",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "action.disabledBackground",
                    color: "action.disabled",
                  },
                  height: 40,
                  width: 40,
                  borderRadius: 2.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.2s ease",
                  boxShadow: "0 2px 4px rgba(88, 86, 214, 0.2)",
                }}
              >
                {aiAssistanceMutation.isPending ? (
                  <CircularProgress size={18} color="inherit" thickness={4} />
                ) : (
                  <Sparkles size={18} />
                )}
              </IconButton>
            </Tooltip>
          ) : (
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={
                (!message.trim() && !selectedFile) ||
                isOverLimit ||
                sendMessageMutation.isPending
              }
              sx={{
                backgroundColor: "primary.main",
                color: "white",
                flexShrink: 0,
                "&:hover": {
                  backgroundColor: "primary.dark",
                  transform: "scale(1.05)",
                },
                "&.Mui-disabled": {
                  backgroundColor: "action.disabledBackground",
                  color: "action.disabled",
                },
                height: 40,
                width: 40,
                borderRadius: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.2s ease",
                boxShadow: "0 2px 4px rgba(0, 122, 255, 0.2)",
              }}
            >
              {sendMessageMutation.isPending ? (
                <CircularProgress size={18} color="inherit" thickness={4} />
              ) : (
                <Send size={18} />
              )}
            </IconButton>
          )}
        </Box>
      </Paper>
    </>
  );
};
