import { useState, useRef, ChangeEvent, KeyboardEvent, DragEvent } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { Send, ImagePlus, X } from 'lucide-react';
import { messagesService } from '@/services/messages.service';

const MAX_MESSAGE_LENGTH = 200;

interface MessageInputProps {
  onSend: (message: { content?: string; media?: string }) => void;
  isPending?: boolean;
}

export const MessageInput = ({
  onSend,
  isPending = false,
}: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (
      (message.trim() || selectedFile) &&
      message.length <= MAX_MESSAGE_LENGTH &&
      !isUploading
    ) {
      let mediaUrl: string | undefined;

      if (selectedFile) {
        setIsUploading(true);
        setError(null);
        try {
          mediaUrl = await messagesService.uploadImage(selectedFile);
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            'Failed to upload image. Please try again.';
          setError(errorMessage);
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      onSend({
        content: message.trim() || undefined,
        media: mediaUrl || undefined,
      });
      setMessage('');
      setMediaPreview(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const processImageFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    setMediaPreview(null);
    setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isPending && !isUploading) {
      setDragCounter((prev) => prev + 1);
      setIsDragging(true);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => {
      const newCounter = prev - 1;
      if (newCounter === 0) {
        setIsDragging(false);
      }
      return newCounter;
    });
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);

    if (isPending || isUploading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      processImageFile(file);
    }
  };

  const remaining = MAX_MESSAGE_LENGTH - message.length;
  const isOverLimit = remaining < 0;

  return (
    <>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Paper
        elevation={3}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
          sx={{
            position: 'sticky',
            bottom: 0,
            backgroundColor: isDragging ? 'action.hover' : 'background.paper',
            borderTop: 1,
            borderColor: isDragging ? 'primary.main' : 'divider',
            borderWidth: isDragging ? 2 : 1,
            borderStyle: 'solid',
            p: 2,
            transition: 'all 0.2s ease-in-out',
          }}
      >
      {mediaPreview && (
        <Box
          sx={{
            mb: 2,
            position: 'relative',
            display: 'inline-block',
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
              objectFit: 'cover',
            }}
          />
          <IconButton
            size="small"
            onClick={handleRemoveImage}
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              backgroundColor: 'error.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'error.dark',
              },
            }}
          >
            <X size={16} />
          </IconButton>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageSelect}
        />
        <Tooltip title="Add image">
          <IconButton
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending || isUploading}
            sx={{
              color: 'primary.main',
            }}
          >
            <ImagePlus size={24} />
          </IconButton>
        </Tooltip>

        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Type a message…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isPending || isUploading}
          error={isOverLimit}
          helperText={
            remaining <= 20
              ? `${remaining} characters ${isOverLimit ? 'over limit' : 'remaining'}`
              : ''
          }
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
            },
          }}
        />

        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={
            (!message.trim() && !selectedFile) || isOverLimit || isPending || isUploading
          }
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            '&.Mui-disabled': {
              backgroundColor: 'action.disabledBackground',
              color: 'action.disabled',
            },
            height: 40,
            width: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isUploading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <Send size={20} />
          )}
        </IconButton>
      </Box>
    </Paper>
    </>
  );
};
