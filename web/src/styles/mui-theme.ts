import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  typography: {
    fontFamily: "'Inter', sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: '0.8125rem',
          textTransform: 'none',
          borderRadius: 'var(--radius-buttonspill, 32px)',
          padding: '0.5rem 0.75rem',
        },
        outlined: {
          color: 'var(--color-graphite)',
          borderColor: 'var(--color-stone-surface)',
          '&:hover': {
            borderColor: 'var(--color-fog)',
            backgroundColor: 'var(--color-parchment-card)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          fontFamily: "'Inter', sans-serif",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 'var(--radius-cardslarge, 24px)',
          padding: '0.5rem',
          boxShadow: 'var(--shadow-subtle)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: "'Inter', sans-serif",
          fontSize: '1.125rem',
          fontWeight: 600,
          color: 'var(--color-charcoal-primary)',
          padding: '1.25rem 1.25rem 0.25rem',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.8125rem',
          color: 'var(--color-graphite)',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '0.25rem 1.25rem 1.25rem',
          gap: '0.5rem',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.75rem',
          padding: '0.5rem 0.75rem',
          borderBottom: 'none',
          color: 'var(--color-graphite)',
        },
        head: {
          fontWeight: 600,
          fontSize: '0.675rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--color-ash)',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'var(--color-parchment-card)',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.8125rem',
          borderRadius: 'var(--radius-inputs, 10px)',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.8125rem',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.8125rem',
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.75rem',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.8125rem',
          borderRadius: 'var(--radius-inputs, 10px)',
        },
      },
    },
  },
})
