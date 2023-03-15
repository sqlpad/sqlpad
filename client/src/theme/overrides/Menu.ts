import { Theme } from "@mui/material/styles"

// ----------------------------------------------------------------------

export default function Menu(theme: Theme) {
  return {
    MuiMenuItem: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: theme.palette.action.selected,
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
          },
        },
      },
    },
  }
}
