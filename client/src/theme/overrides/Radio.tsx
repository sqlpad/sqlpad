import React from "react";
import { Theme } from "@mui/material/styles"
import { RadioProps } from "@mui/material"
//
import { RadioIcon, RadioCheckedIcon } from "./CustomIcons"

// ----------------------------------------------------------------------

export default function Radio(theme: Theme) {
  return {
    MuiRadio: {
      defaultProps: {
        icon: <RadioIcon />,
        checkedIcon: <RadioCheckedIcon />,
      },

      styleOverrides: {
        root: ({ ownerState }: { ownerState: RadioProps }) => ({
          padding: theme.spacing(1),
          ...(ownerState.size === "small" && {
            "& svg": { width: 20, height: 20 },
          }),
          ...(ownerState.size === "medium" && {
            "& svg": { width: 24, height: 24 },
          }),
        }),
      },
    },
  }
}
