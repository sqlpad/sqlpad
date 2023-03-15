import React from "react";
import { ListItemButtonProps } from "@mui/material"

// ----------------------------------------------------------------------

export type NavItemProps = {
  title: string
  path: string
  icon?: React.ReactElement
  children?: {
    subheader: string
    items: {
      title: string
      path: string
    }[]
  }[]
}

export interface NavItemDesktopProps extends ListItemButtonProps {
  item: NavItemProps
  isOffset?: boolean
  active?: boolean
  open?: boolean
  subItem?: boolean
  isExternalLink?: boolean
}

export interface NavItemMobileProps extends ListItemButtonProps {
  item: NavItemProps
  active?: boolean
  open?: boolean
  isExternalLink?: boolean
}

export type NavProps = {
  isOffset: boolean
  data: NavItemProps[]
}
