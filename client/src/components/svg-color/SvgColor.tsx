import React, { forwardRef } from "react"
// @mui
import { Box, BoxProps } from "@mui/material"

// ----------------------------------------------------------------------

export interface SvgColorProps extends BoxProps {
  src: string
}

const SvgColor = forwardRef<HTMLSpanElement, SvgColorProps>(({ src, sx, ...other }, ref) => (
  <Box
    component="span"
    className="svg-color"
    ref={ref}
    sx={{
      width: 24,
      height: 24,
      display: "inline-block",
      bgcolor: "currentColor",
      mask: `url(${src}) no-repeat center / contain`,
      WebkitMask: `url(${src}) no-repeat center / contain`,
      ...sx,
    }}
    {...other}
  />
))

export default SvgColor
