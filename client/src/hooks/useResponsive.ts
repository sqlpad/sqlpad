// @mui
import { Breakpoint } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"

// ----------------------------------------------------------------------

type Query = "up" | "down" | "between" | "only"
type Key = Breakpoint | number
type Start = Breakpoint | number
type End = Breakpoint | number

export default function useResponsive(query: Query, key?: Key, start?: Start, end?: End) {
  const theme = useTheme()

  const mediaUp = useMediaQuery(theme.breakpoints.up(key as Key))

  const mediaDown = useMediaQuery(theme.breakpoints.down(key as Key))

  const mediaBetween = useMediaQuery(theme.breakpoints.between(start as Start, end as End))

  const mediaOnly = useMediaQuery(theme.breakpoints.only(key as Breakpoint))

  if (query === "up") {
    return mediaUp
  }

  if (query === "down") {
    return mediaDown
  }

  if (query === "between") {
    return mediaBetween
  }

  if (query === "only") {
    return mediaOnly
  }
}
