import { alpha, Theme } from "@mui/material/styles"
import { FabProps } from "@mui/material"

// ----------------------------------------------------------------------

const COLORS = ["primary", "secondary", "info", "success", "warning", "error"] as const

// NEW VARIANT
declare module "@mui/material/Fab" {
  interface FabPropsVariantOverrides {
    outlined: true
    outlinedExtended: true
    soft: true
    softExtended: true
  }
}

export default function Fab(theme: Theme) {
  const isLight = theme.palette.mode === "light"

  const rootStyle = (ownerState: FabProps) => {
    const defaultColor = ownerState.color === "default"

    const inheritColor = ownerState.color === "inherit"

    const circularVariant = ownerState.variant === "circular"

    const extendedVariant = ownerState.variant === "extended"

    const outlinedVariant = ownerState.variant === "outlined"

    const outlinedExtendedVariant = ownerState.variant === "outlinedExtended"

    const softVariant = ownerState.variant === "soft"

    const softExtendedVariant = ownerState.variant === "softExtended"

    const defaultStyle = {
      "&:hover, &:active": {
        boxShadow: "none",
      },
      ...((circularVariant || extendedVariant) && {
        ...((defaultColor || inheritColor) && {
          color: theme.palette.grey[800],
          boxShadow: theme.customShadows.z8,
          "&:hover": {
            backgroundColor: theme.palette.grey[400],
          },
        }),
        ...(inheritColor && {
          ...(!isLight && {
            color: "inherit",
            backgroundColor: theme.palette.grey[800],
            "&:hover": {
              backgroundColor: theme.palette.grey[700],
            },
          }),
        }),
      }),

      ...((outlinedVariant || outlinedExtendedVariant) && {
        boxShadow: "none",
        backgroundColor: "transparent",
        ...((defaultColor || inheritColor) && {
          border: `solid 1px ${alpha(theme.palette.grey[500], 0.32)}`,
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
        }),
        ...(defaultColor && {
          ...(!isLight && {
            color: theme.palette.text.secondary,
          }),
        }),
      }),

      ...((softVariant || softExtendedVariant) && {
        boxShadow: "none",
        ...(defaultColor && {
          color: theme.palette.grey[800],
          backgroundColor: theme.palette.grey[300],
          "&:hover": {
            backgroundColor: theme.palette.grey[400],
          },
        }),
        ...(inheritColor && {
          backgroundColor: alpha(theme.palette.grey[500], 0.08),
          "&:hover": {
            backgroundColor: alpha(theme.palette.grey[500], 0.24),
          },
        }),
      }),
    }

    const colorStyle = COLORS.map((color) => ({
      ...(ownerState.color === color && {
        ...((circularVariant || extendedVariant) && {
          boxShadow: theme.customShadows[color],
          "&:hover": {
            backgroundColor: theme.palette[color].dark,
          },
        }),
        ...((outlinedVariant || outlinedExtendedVariant) && {
          color: theme.palette[color].main,
          border: `solid 1px ${alpha(theme.palette[color].main, 0.48)}`,
          "&:hover": {
            backgroundColor: alpha(theme.palette[color].main, 0.08),
            border: `solid 1px ${theme.palette[color].main}`,
          },
        }),
        ...((softVariant || softExtendedVariant) && {
          color: theme.palette[color][isLight ? "dark" : "light"],
          backgroundColor: alpha(theme.palette[color].main, 0.16),
          "&:hover": {
            backgroundColor: alpha(theme.palette[color].main, 0.32),
          },
        }),
      }),
    }))

    const disabledState = {
      "&.Mui-disabled": {
        ...((outlinedVariant || outlinedExtendedVariant) && {
          backgroundColor: "transparent",
          border: `solid 1px ${theme.palette.action.disabledBackground}`,
        }),
      },
    }

    const size = {
      ...((extendedVariant || outlinedExtendedVariant || softExtendedVariant) && {
        width: "auto",
        "& svg": {
          marginRight: theme.spacing(1),
        },
        ...(ownerState.size === "small" && {
          height: 34,
          minHeight: 34,
          borderRadius: 17,
          padding: theme.spacing(0, 1),
        }),
        ...(ownerState.size === "medium" && {
          height: 40,
          minHeight: 40,
          borderRadius: 20,
          padding: theme.spacing(0, 2),
        }),
        ...(ownerState.size === "large" && {
          height: 48,
          minHeight: 48,
          borderRadius: 24,
          padding: theme.spacing(0, 2),
        }),
      }),
    }

    return [...colorStyle, defaultStyle, disabledState, size]
  }

  return {
    MuiFab: {
      defaultProps: {
        color: "primary",
      },

      styleOverrides: {
        root: ({ ownerState }: { ownerState: FabProps }) => rootStyle(ownerState),
      },
    },
  }
}
