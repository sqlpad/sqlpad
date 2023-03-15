import React from "react";
// @mui
import { alpha, styled } from "@mui/material/styles"
import { CardActionArea, Radio, FormControlLabel, Stack, Box } from "@mui/material"

// ----------------------------------------------------------------------

export const StyledWrap = styled(Box)(() => ({
  gap: 8,
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
}))

// ----------------------------------------------------------------------

type StyledCardProps = {
  selected: boolean
}

export const StyledCard = styled(CardActionArea, {
  shouldForwardProp: (prop) => prop !== "selected",
})<StyledCardProps>(({ selected, theme }) => ({
  height: 72,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.text.disabled,
  borderRadius: theme.shape.borderRadius,
  border: `solid 1px ${alpha(theme.palette.grey[500], 0.12)}`,
  "& .svg-color": {
    width: 28,
    height: 28,
  },
  ...(selected && {
    color: theme.palette.primary.main,
    boxShadow: theme.customShadows.z12,
    borderColor: alpha(theme.palette.grey[500], 0.24),
  }),
}))

// ----------------------------------------------------------------------

type StyledCircleColorProps = {
  selected: boolean
  color: string
}

export const StyledCircleColor = styled("div", {
  shouldForwardProp: (prop) => prop !== "selected",
})<StyledCircleColorProps>(({ selected, color, theme }) => ({
  width: 12,
  height: 12,
  borderRadius: "50%",
  backgroundColor: color,
  transition: theme.transitions.create(["width", "height"], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  ...(selected && {
    width: 24,
    height: 24,
    boxShadow: `-2px 4px 8px 0px ${alpha(color, 0.48)}`,
  }),
}))

// ----------------------------------------------------------------------

type MaskControlProps = {
  value: string
}

export function MaskControl({ value }: MaskControlProps) {
  return (
    <FormControlLabel
      label=""
      value={value}
      control={<Radio sx={{ display: "none" }} />}
      sx={{
        m: 0,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        position: "absolute",
      }}
    />
  )
}

// ----------------------------------------------------------------------

type LayoutIconValue = {
  layout: "vertical" | "horizontal" | "mini"
}

export function LayoutIcon({ layout }: LayoutIconValue) {
  const WIDTH = 16

  const HEIGHT = 10

  const SPACING = 0.5

  const RADIUS = 0.5

  const isNavHorizontal = layout === "horizontal"

  const isNavMini = layout === "mini"

  const styles = {
    width: 1,
    height: 1,
    borderRadius: RADIUS,
    position: "absolute",
  }

  return (
    <Stack direction={layout === "horizontal" ? "column" : "row"} sx={{ width: 1, height: 1 }}>
      <Box
        sx={{
          mr: SPACING,
          width: WIDTH,
          opacity: 0.72,
          borderRadius: RADIUS,
          bgcolor: "currentColor",
          ...(isNavHorizontal && {
            width: 1,
            mb: SPACING,
            height: HEIGHT,
            borderRadius: RADIUS / 1.5,
          }),
          ...(isNavMini && {
            width: WIDTH / 2,
            borderRadius: RADIUS / 2,
          }),
        }}
      />

      <Box sx={{ flexGrow: 1, position: "relative", borderRadius: RADIUS }}>
        <Box sx={{ ...styles, opacity: 0.16, bgcolor: "currentColor" }} />
        <Box sx={{ ...styles, opacity: 0.48, border: `dashed 1px currentColor` }} />
      </Box>
    </Stack>
  )
}
