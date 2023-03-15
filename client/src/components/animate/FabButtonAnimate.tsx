import { m } from "framer-motion"
import React, { forwardRef } from "react"
// @mui
import { Box, Fab, FabProps, SxProps } from "@mui/material"

// ----------------------------------------------------------------------

export interface FabButtonAnimateProps extends FabProps {
  sxWrap?: SxProps
}

const FabButtonAnimate = forwardRef<HTMLButtonElement, FabButtonAnimateProps>(({ size = "large", children, sx, sxWrap, ...other }, ref) => (
  <AnimateWrap size={size} sxWrap={sxWrap}>
    <Fab ref={ref} size={size} sx={sx} {...other}>
      {children}
    </Fab>
  </AnimateWrap>
))

export default FabButtonAnimate

// ----------------------------------------------------------------------

type AnimateWrapProp = {
  children: React.ReactNode
  size: "small" | "medium" | "large"
  sxWrap?: SxProps
}

const varSmall = {
  hover: { scale: 1.07 },
  tap: { scale: 0.97 },
}

const varMedium = {
  hover: { scale: 1.06 },
  tap: { scale: 0.98 },
}

const varLarge = {
  hover: { scale: 1.05 },
  tap: { scale: 0.99 },
}

function AnimateWrap({ size, children, sxWrap }: AnimateWrapProp) {
  const isSmall = size === "small"
  const isLarge = size === "large"

  return (
    <Box
      component={m.div}
      whileTap="tap"
      whileHover="hover"
      variants={(isSmall && varSmall) || (isLarge && varLarge) || varMedium}
      sx={{
        display: "inline-flex",
        ...sxWrap,
      }}
    >
      {children}
    </Box>
  )
}
