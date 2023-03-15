import React, { useState } from "react"
// @mui
import { alpha, useTheme } from "@mui/material/styles"
import { Box, Divider, Drawer, Stack, Typography, Tooltip, IconButton } from "@mui/material"
// config
import { NAV } from "../../../config-global"
//
import Iconify from "../../iconify"
//
import { defaultSettings } from "../config-setting"
import { useSettingsContext } from "../SettingsContext"
import Block from "./Block"
import BadgeDot from "./BadgeDot"
import ToggleButton from "./ToggleButton"
import ModeOptions from "./ModeOptions"
import LayoutOptions from "./LayoutOptions"
import StretchOptions from "./StretchOptions"
import ContrastOptions from "./ContrastOptions"
import DirectionOptions from "./DirectionOptions"
import FullScreenOptions from "./FullScreenOptions"
import ColorPresetsOptions from "./ColorPresetsOptions"

// ----------------------------------------------------------------------

const SPACING = 2.5

export default function SettingsDrawer() {
  const { themeMode, themeLayout, themeStretch, themeContrast, themeDirection, themeColorPresets, onResetSetting } = useSettingsContext()

  const theme = useTheme()

  const [open, setOpen] = useState(false)

  const handleToggle = () => {
    setOpen(!open)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const notDefault =
    themeMode !== defaultSettings.themeMode ||
    themeLayout !== defaultSettings.themeLayout ||
    themeStretch !== defaultSettings.themeStretch ||
    themeContrast !== defaultSettings.themeContrast ||
    themeDirection !== defaultSettings.themeDirection ||
    themeColorPresets !== defaultSettings.themeColorPresets

  return (
    <>
      {!open && <ToggleButton open={open} notDefault={notDefault} onToggle={handleToggle} />}

      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        BackdropProps={{ invisible: true }}
        PaperProps={{
          sx: {
            width: NAV.W_BASE,
            boxShadow: `-24px 12px 40px 0 ${alpha(
              theme.palette.mode === "light" ? theme.palette.grey[500] : theme.palette.common.black,
              0.16
            )}`,
          },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 2, pr: 1, pl: SPACING }}>
          <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
            Settings
          </Typography>

          <Tooltip title="Reset">
            <Box sx={{ position: "relative" }}>
              {notDefault && <BadgeDot />}
              <IconButton onClick={onResetSetting}>
                <Iconify icon="ic:round-refresh" />
              </IconButton>
            </Box>
          </Tooltip>

          <IconButton onClick={handleClose}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>

        <Divider sx={{ borderStyle: "dashed" }} />

        <Block title="Mode">
          <ModeOptions />
        </Block>

        <Block title="Contrast">
          <ContrastOptions />
        </Block>

        <Block title="Direction">
          <DirectionOptions />
        </Block>

        <Block title="Layout">
          <LayoutOptions />
        </Block>

        <Block title="Stretch" tooltip="Only available at large resolutions > 1600px (xl)">
          <StretchOptions />
        </Block>

        <Block title="Presets">
          <ColorPresetsOptions />
        </Block>

        <Box sx={{ p: SPACING, pt: 0 }}>
          <FullScreenOptions />
        </Box>
      </Drawer>
    </>
  )
}
