import React from "react";
import { alpha, Theme } from "@mui/material/styles"
import { ChipProps } from "@mui/material"
//
import { CloseIcon } from "./CustomIcons"

// ----------------------------------------------------------------------

const COLORS = ["primary", "secondary", "info", "success", "warning", "error"] as const

// NEW VARIANT
declare module "@mui/material/Chip" {
  interface ChipPropsVariantOverrides {
    soft: true
  }
}

export default function Chip(theme: Theme) {
  const isLight = theme.palette.mode === "light"

  const rootStyle = (ownerState: ChipProps) => {
    const defaultColor = ownerState.color === "default"

    const filledVariant = ownerState.variant === "filled"

    const outlinedVariant = ownerState.variant === "outlined"

    const softVariant = ownerState.variant === "soft"

    const defaultStyle = {
      ...(defaultColor && {
        "& .MuiChip-avatar": {
          color: theme.palette.text[isLight ? "secondary" : "primary"],
          backgroundColor: alpha(theme.palette.grey[500], 0.48),
        },
        // OUTLINED
        ...(outlinedVariant && {
          border: `solid 1px ${alpha(theme.palette.grey[500], 0.32)}`,
        }),
        // SOFT
        ...(softVariant && {
          color: theme.palette.text.primary,
          backgroundColor: alpha(theme.palette.grey[500], 0.16),
          "&:hover": {
            backgroundColor: alpha(theme.palette.grey[500], 0.32),
          },
        }),
      }),
    }

    const colorStyle = COLORS.map((color) => ({
      ...(ownerState.color === color && {
        "& .MuiChip-avatar": {
          color: theme.palette[color].lighter,
          backgroundColor: theme.palette[color].dark,
        },
        // FILLED
        ...(filledVariant && {
          "& .MuiChip-deleteIcon": {
            color: alpha(theme.palette[color].contrastText, 0.56),
            "&:hover": {
              color: theme.palette[color].contrastText,
            },
          },
        }),
        // SOFT
        ...(softVariant && {
          color: theme.palette[color][isLight ? "dark" : "light"],
          backgroundColor: alpha(theme.palette[color].main, 0.16),
          "&:hover": {
            backgroundColor: alpha(theme.palette[color].main, 0.32),
          },
          "& .MuiChip-deleteIcon": {
            color: alpha(theme.palette[color][isLight ? "dark" : "light"], 0.48),
            "&:hover": {
              color: theme.palette[color].dark,
            },
          },
        }),
      }),
    }))

    return [...colorStyle, defaultStyle]
  }

  return {
    MuiChip: {
      defaultProps: {
        deleteIcon: <CloseIcon />,
      },

      styleOverrides: {
        root: ({ ownerState }: { ownerState: ChipProps }) => rootStyle(ownerState),
      },
    },
  }
}
