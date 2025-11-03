import { Box, CircularProgress } from "@mui/material";

export const ChatWindowLoading = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <CircularProgress size={40} thickness={4} />
    </Box>
  );
};

