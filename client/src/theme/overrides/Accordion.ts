import { Theme } from "@mui/material/styles"

// ----------------------------------------------------------------------

export default function Accordion(theme: Theme) {
  return {
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: "transparent",
          "&.Mui-expanded": {
            boxShadow: theme.customShadows.z8,
            borderRadius: theme.shape.borderRadius,
            backgroundColor: theme.palette.background.paper,
          },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          paddingLeft: theme.spacing(2),
          paddingRight: theme.spacing(1),
          "&.Mui-disabled": {
            opacity: 1,
            color: theme.palette.action.disabled,
            "& .MuiTypography-root": {
              color: "inherit",
            },
          },
        },
        expandIconWrapper: {
          color: "inherit",
        },
      },
    },
  }
}
