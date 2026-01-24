import * as React from "react";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { Box, Typography } from "@mui/material";

type SimpleBackdropProps = {
  open?: boolean;
  message?: string;
};

export default function SimpleBackdrop({
  open = false,
  message = "",
}: SimpleBackdropProps) {
  return (
    <Backdrop
      sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
      open={open}
    >
      <Box display="flex" justifyContent="center" alignItems="center" m={2} flexDirection={"column"}>
        <CircularProgress color="inherit" />
        <Typography variant="h6" color="inherit">
          {message}
        </Typography>
      </Box>
    </Backdrop>
  );
}
