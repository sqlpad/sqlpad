import React from "react";
// @mui
import { Stack, Tooltip, Typography, StackProps } from "@mui/material"
//
import Iconify from "../../iconify"

// ----------------------------------------------------------------------

const SPACING = 2.5

interface Props extends StackProps {
  title: string
  tooltip?: string
}

export default function Block({ title, tooltip, children, sx, ...other }: Props) {
  return (
    <Stack spacing={1.5} sx={{ mb: SPACING, ...sx }} {...other}>
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          color: "text.secondary",
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: "fontWeightMedium" }}>
          {title}
        </Typography>

        {tooltip && (
          <Tooltip title={tooltip}>
            <Iconify icon="eva:info-outline" width={16} sx={{ mx: 0.5 }} />
          </Tooltip>
        )}
      </Stack>

      {children}
    </Stack>
  )
}
