import React from "react";
// @mui
import { alpha, useTheme } from "@mui/material/styles"
import { Tooltip, Box } from "@mui/material"
// utils
import { bgBlur } from "../../../utils/cssStyles"
//
import { IconButtonAnimate } from "../../animate"
import SvgColor from "../../svg-color"
//
import BadgeDot from "./BadgeDot"

// ----------------------------------------------------------------------

type Props = {
  open: boolean
  notDefault: boolean
  onToggle: VoidFunction
}

export default function ToggleButton({ notDefault, open, onToggle }: Props) {
  const theme = useTheme()

  return (
    <Box
      sx={{
        p: 0.5,
        right: 24,
        bottom: 24,
        zIndex: 999,
        position: "fixed",
        borderRadius: "50%",
        boxShadow: `-12px 12px 32px -4px ${alpha(
          theme.palette.mode === "light" ? theme.palette.grey[600] : theme.palette.common.black,
          0.36
        )}`,
        ...bgBlur({ color: theme.palette.background.default }),
      }}
    >
      {notDefault && !open && (
        <BadgeDot
          sx={{
            top: 8,
            right: 10,
          }}
        />
      )}

      <Tooltip title="Settings">
        <IconButtonAnimate color="primary" onClick={onToggle} sx={{ p: 1.25 }}>
          <SvgColor src="/assets/icons/setting/ic_setting.svg" />
        </IconButtonAnimate>
      </Tooltip>
    </Box>
  )
}
