import React from "react";
import { Theme } from "@mui/material/styles"
//
import { TreeViewCollapseIcon, TreeViewExpandIcon, TreeViewEndIcon } from "./CustomIcons"

// ----------------------------------------------------------------------

export default function TreeView(theme: Theme) {
  return {
    MuiTreeView: {
      defaultProps: {
        defaultCollapseIcon: <TreeViewCollapseIcon sx={{ width: 20, height: 20 }} />,
        defaultExpandIcon: <TreeViewExpandIcon sx={{ width: 20, height: 20 }} />,
        defaultEndIcon: <TreeViewEndIcon sx={{ color: "text.secondary", width: 20, height: 20 }} />,
      },
    },
    MuiTreeItem: {
      styleOverrides: {
        label: {
          ...theme.typography.body2,
        },
        iconContainer: {
          width: "auto",
        },
      },
    },
  }
}
