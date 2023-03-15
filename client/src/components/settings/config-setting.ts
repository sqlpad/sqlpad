import { SettingsValueProps } from "./types"

// PLEASE REMOVE `LOCAL STORAGE` WHEN YOU CHANGE SETTINGS.
// ----------------------------------------------------------------------

export const defaultSettings: SettingsValueProps = {
  themeMode: "light",
  themeDirection: "ltr",
  themeContrast: "default",
  themeLayout: "vertical",
  themeColorPresets: "default",
  themeStretch: false,
}
