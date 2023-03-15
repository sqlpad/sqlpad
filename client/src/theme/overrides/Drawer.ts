import { alpha, Theme } from "@mui/material/styles"
import { DrawerProps } from "@mui/material"

// ----------------------------------------------------------------------

export default function Drawer(theme: Theme) {
  const isLight = theme.palette.mode === "light"

  return {
    MuiDrawer: {
      styleOverrides: {
        root: ({ ownerState }: { ownerState: DrawerProps }) => ({
          ...(ownerState.variant === "temporary" && {
            "& .MuiDrawer-paper": {
              boxShadow: `-40px 40px 80px -8px ${alpha(isLight ? theme.palette.grey[500] : theme.palette.common.black, 0.24)}`,
            },
          }),
        }),
      },
    },
  }
}
