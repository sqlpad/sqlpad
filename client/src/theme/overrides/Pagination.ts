import { alpha, Theme } from "@mui/material/styles"
import { PaginationProps } from "@mui/material"

// ----------------------------------------------------------------------

const COLORS = ["primary", "secondary", "info", "success", "warning", "error"] as const

// NEW VARIANT
declare module "@mui/material/Pagination" {
  interface PaginationPropsVariantOverrides {
    soft: true
  }

  interface PaginationPropsColorOverrides {
    info: true
    success: true
    warning: true
    error: true
  }
}

export default function Pagination(theme: Theme) {
  const isLight = theme.palette.mode === "light"

  const rootStyle = (ownerState: PaginationProps) => {
    const outlinedVariant = ownerState.variant === "outlined"

    const softVariant = ownerState.variant === "soft"

    const defaultStyle = {
      "& .MuiPaginationItem-root": {
        ...(outlinedVariant && {
          borderColor: alpha(theme.palette.grey[500], 0.32),
        }),
        "&.Mui-selected": {
          fontWeight: theme.typography.fontWeightMedium,
        },
      },
    }

    const colorStyle = COLORS.map((color) => ({
      ...(ownerState.color === color && {
        ...(softVariant && {
          "& .MuiPaginationItem-root": {
            "&.Mui-selected": {
              color: theme.palette[color][isLight ? "dark" : "light"],
              backgroundColor: alpha(theme.palette[color].main, 0.16),
              "&:hover": {
                backgroundColor: alpha(theme.palette[color].main, 0.32),
              },
            },
          },
        }),
      }),
    }))

    return [...colorStyle, defaultStyle]
  }

  return {
    MuiPagination: {
      defaultProps: {
        color: "primary",
      },

      styleOverrides: {
        root: ({ ownerState }: { ownerState: PaginationProps }) => rootStyle(ownerState),
      },
    },
  }
}
