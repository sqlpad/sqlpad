import React from "react"
import ThemeContrast from "./ThemeContrast"
import ThemeColorPresets from "./ThemeColorPresets"

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode
}

export default function ThemeSettings({ children }: Props) {
  return (
    <ThemeColorPresets>
      <ThemeContrast>
        {children}
        {/*<SettingsDrawer /> */}
      </ThemeContrast>
    </ThemeColorPresets>
  )
}
