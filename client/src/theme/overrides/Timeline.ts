import { Theme } from "@mui/material/styles"

// ----------------------------------------------------------------------

export default function Timeline(theme: Theme) {
  return {
    MuiTimelineDot: {
      styleOverrides: {
        root: {
          boxShadow: "none",
        },
      },
    },

    MuiTimelineConnector: {
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.divider,
        },
      },
    },
  }
}
