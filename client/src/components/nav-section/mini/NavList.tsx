import React, { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
// hooks
import useActiveLink from "../../../hooks/useActiveLink"
//
import { NavListProps } from "../types"
import { StyledPopover } from "./styles"
import NavItem from "./NavItem"

// ----------------------------------------------------------------------

type NavListRootProps = {
  data: NavListProps
  depth: number
  hasChild: boolean
}

export default function NavList({ data, depth, hasChild }: NavListRootProps) {
  const navRef = useRef(null)

  const { pathname } = useLocation()

  const { active, isExternalLink } = useActiveLink(data.path)

  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) {
      handleClose()
    }
  }, [pathname])

  useEffect(() => {
    const appBarEl = Array.from(document.querySelectorAll(".MuiAppBar-root")) as Array<HTMLElement>

    // Reset styles when hover
    const styles = () => {
      document.body.style.overflow = ""
      document.body.style.padding = ""
      // Apply for Window
      appBarEl.forEach((elem) => {
        elem.style.padding = ""
      })
    }

    if (open) {
      styles()
    } else {
      styles()
    }
  }, [open])

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>
      <NavItem
        ref={navRef}
        item={data}
        depth={depth}
        open={open}
        active={active}
        isExternalLink={isExternalLink}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
      />

      {hasChild && (
        <StyledPopover
          open={open}
          anchorEl={navRef.current}
          anchorOrigin={{ vertical: "center", horizontal: "right" }}
          transformOrigin={{ vertical: "center", horizontal: "left" }}
          PaperProps={{
            onMouseEnter: handleOpen,
            onMouseLeave: handleClose,
          }}
        >
          <NavSubList data={data.children} depth={depth} />
        </StyledPopover>
      )}
    </>
  )
}

// ----------------------------------------------------------------------

type NavListSubProps = {
  data: NavListProps[]
  depth: number
}

function NavSubList({ data, depth }: NavListSubProps) {
  return (
    <>
      {data.map((list) => (
        <NavList key={list.title + list.path} data={list} depth={depth + 1} hasChild={!!list.children} />
      ))}
    </>
  )
}
