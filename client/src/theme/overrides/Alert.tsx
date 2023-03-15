import React from "react";
import { Theme } from "@mui/material/styles"
import { AlertProps } from "@mui/material"
//
import { ErrorIcon, InfoIcon, SuccessIcon, WarningIcon } from "./CustomIcons"

// ----------------------------------------------------------------------

const COLORS = ["info", "success", "warning", "error"] as const

export default function Alert(theme: Theme) {
  const isLight = theme.palette.mode === "light"

  const rootStyle = (ownerState: AlertProps) => {
    const standardVariant = ownerState.variant === "standard"

    const filledVariant = ownerState.variant === "filled"

    const outlinedVariant = ownerState.variant === "outlined"

    const colorStyle = COLORS.map((color) => ({
      ...(ownerState.severity === color && {
        // STANDARD
        ...(standardVariant && {
          color: theme.palette[color][isLight ? "darker" : "lighter"],
          backgroundColor: theme.palette[color][isLight ? "lighter" : "darker"],
          "& .MuiAlert-icon": {
            color: theme.palette[color][isLight ? "main" : "light"],
          },
        }),
        // FILLED
        ...(filledVariant && {
          color: theme.palette[color].contrastText,
          backgroundColor: theme.palette[color].main,
        }),
        // OUTLINED
        ...(outlinedVariant && {
          color: theme.palette[color][isLight ? "dark" : "light"],
          border: `solid 1px ${theme.palette[color].main}`,
          "& .MuiAlert-icon": {
            color: theme.palette[color].main,
          },
        }),
      }),
    }))

    return [...colorStyle]
  }

  return {
    MuiAlert: {
      defaultProps: {
        iconMapping: {
          info: <InfoIcon />,
          success: <SuccessIcon />,
          warning: <WarningIcon />,
          error: <ErrorIcon />,
        },
      },

      styleOverrides: {
        root: ({ ownerState }: { ownerState: AlertProps }) => rootStyle(ownerState),
        icon: {
          opacity: 1,
        },
      },
    },
    MuiAlertTitle: {
      styleOverrides: {
        root: {
          marginBottom: theme.spacing(0.5),
        },
      },
    },
  }
}
