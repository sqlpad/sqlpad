import { Theme } from "@mui/material/styles"

// ----------------------------------------------------------------------

export default function Table(theme: Theme) {
  return {
    MuiTableContainer: {
      styleOverrides: {
        root: {
          position: "relative",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: theme.palette.action.selected,
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "none",
        },
        head: {
          color: theme.palette.text.secondary,
          backgroundColor: theme.palette.background.neutral,
        },
        stickyHeader: {
          backgroundColor: theme.palette.background.paper,
          backgroundImage: `linear-gradient(to bottom, ${theme.palette.background.neutral} 0%, ${theme.palette.background.neutral} 100%)`,
        },
        paddingCheckbox: {
          paddingLeft: theme.spacing(1),
        },
      },
    },
    MuiTablePagination: {
      defaultProps: {
        backIconButtonProps: {
          size: "small",
        },
        nextIconButtonProps: {
          size: "small",
        },
        SelectProps: {
          MenuProps: {
            MenuListProps: {
              sx: {
                "& .MuiMenuItem-root": {
                  ...theme.typography.body2,
                },
              },
            },
          },
        },
      },

      styleOverrides: {
        root: {
          borderTop: `solid 1px ${theme.palette.divider}`,
        },
        toolbar: {
          height: 64,
        },
        actions: {
          marginRight: theme.spacing(1),
        },
        select: {
          "&:focus": {
            borderRadius: theme.shape.borderRadius,
          },
        },
      },
    },
  }
}
