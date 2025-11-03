import { Box, IconButton } from "@mui/material";
import { X } from "lucide-react";

interface ImagePreviewProps {
  src: string;
  onRemove: () => void;
}

export const ImagePreview = ({ src, onRemove }: ImagePreviewProps) => {
  return (
    <Box
      sx={{
        mb: 1.5,
        position: "relative",
        display: "inline-block",
      }}
    >
      <Box
        component="img"
        src={src}
        alt="Preview"
        sx={{
          maxWidth: 200,
          maxHeight: 150,
          borderRadius: 2.5,
          objectFit: "cover",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      />
      <IconButton
        size="small"
        onClick={onRemove}
        sx={{
          position: "absolute",
          top: -8,
          right: -8,
          backgroundColor: "error.main",
          color: "white",
          width: 24,
          height: 24,
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
          "&:hover": {
            backgroundColor: "error.dark",
            transform: "scale(1.1)",
          },
          transition: "transform 0.2s ease",
        }}
      >
        <X size={14} />
      </IconButton>
    </Box>
  );
};

