import { matchPath, useLocation } from "react-router-dom"

// ----------------------------------------------------------------------

type ReturnType = {
  active: boolean
  isExternalLink: boolean
}

export default function useActiveLink(path: string, deep = true): ReturnType {
  const { pathname } = useLocation()

  const normalActive = path ? !!matchPath(pathname,{ path, exact: true } ) : false

  const deepActive = path ? !!matchPath(pathname,{ path, exact: false } ) : false

  return {
    active: deep ? deepActive : normalActive,
    isExternalLink: path.includes("http"),
  }
}
