// @mui
import React from "react";
import { Box, BoxProps } from "@mui/material"

// ----------------------------------------------------------------------

export default function BadgeDot({ sx, ...other }: BoxProps) {
  return (
    <Box
      sx={{
        top: 6,
        right: 4,
        width: 8,
        height: 8,
        borderRadius: "50%",
        position: "absolute",
        bgcolor: "error.main",
        ...sx,
      }}
      {...other}
    />
  )
}
