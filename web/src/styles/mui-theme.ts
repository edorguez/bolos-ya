import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#339933',
      light: '#e5f2e5',
      dark: '#287a28',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#F4A261',
      contrastText: '#2A1C0E',
    },
    error: {
      main: '#ff2b3a',
      light: 'rgba(255, 43, 58, 0.08)',
      contrastText: '#ffffff',
    },
    background: {
      default: '#fbfaf9',
      paper: '#ffffff',
    },
    text: {
      primary: '#474645',
      secondary: '#848281',
    },
    divider: '#f2f0ed',
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    button: {
      fontWeight: 600,
      letterSpacing: '-0.1px',
    },
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
          transition: 'background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        outlined: {
          color: 'var(--color-charcoal-primary)',
          borderColor: 'var(--color-stone-surface)',
          backgroundColor: '#ffffff',
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
          padding: '0.75rem',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--color-stone-surface)',
          backgroundImage: 'none',
        },
      },
      defaultProps: {
        slotProps: {
          backdrop: {
            style: {
              backgroundColor: 'rgba(52, 52, 51, 0.32)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            },
          },
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: "'Fraunces', ui-serif, Georgia, serif",
          fontSize: '1.375rem',
          fontWeight: 700,
          lineHeight: 1.2,
          letterSpacing: '-0.5px',
          color: 'var(--color-charcoal-primary)',
          padding: '1.25rem 1.25rem 0.75rem',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.8125rem',
          color: 'var(--color-graphite)',
          lineHeight: 1.5,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '0.75rem 1.25rem 1.25rem',
          gap: '0.5rem',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: 'var(--color-ash)',
          transition: 'background 0.2s ease, color 0.2s ease',
          '&:hover': {
            backgroundColor: 'var(--color-parchment-card)',
            color: 'var(--color-charcoal-primary)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.75rem',
          padding: '0.75rem 0.875rem',
          borderBottom: '1px solid var(--color-stone-surface)',
          color: 'var(--color-graphite)',
        },
        head: {
          fontWeight: 600,
          fontSize: '0.6875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--color-ash)',
          borderBottom: '1px solid var(--color-fog)',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.2s ease',
          '&:hover': {
            backgroundColor: 'var(--color-parchment-card)',
          },
        },
      },
    },
    MuiTableSortLabel: {
      styleOverrides: {
        root: {
          color: 'var(--color-ash)',
          '&:hover': {
            color: 'var(--color-charcoal-primary)',
          },
          '&.Mui-active': {
            color: 'var(--color-primary)',
          },
        },
        icon: {
          opacity: 1,
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.75rem',
          color: 'var(--color-ash)',
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          fontFamily: "'Inter', sans-serif",
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
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.8125rem',
          borderRadius: 'var(--radius-inputs, 10px)',
          backgroundColor: 'var(--color-parchment-card)',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'transparent',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-stone-surface)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-primary)',
            borderWidth: '1px',
          },
          '&.Mui-focused': {
            backgroundColor: '#ffffff',
          },
        },
      },
    },
    MuiSelect: {
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
  },
})
