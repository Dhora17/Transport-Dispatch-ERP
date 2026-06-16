import { createTheme, alpha } from '@mui/material/styles';

const commonTypography = {
  fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: { fontWeight: 800, letterSpacing: '-0.03em' },
  h2: { fontWeight: 800, letterSpacing: '-0.02em' },
  h3: { fontWeight: 700, letterSpacing: '-0.02em' },
  h4: { fontWeight: 700, letterSpacing: '-0.015em' },
  h5: { fontWeight: 700, letterSpacing: '-0.01em' },
  h6: { fontWeight: 600, letterSpacing: '-0.01em' },
  subtitle1: { fontWeight: 500, letterSpacing: '-0.005em' },
  subtitle2: { fontWeight: 600, letterSpacing: '-0.005em' },
  body1: { letterSpacing: '-0.005em' },
  body2: { letterSpacing: '-0.005em' },
  button: { fontWeight: 700, letterSpacing: '0.02em', textTransform: 'none' as const },
};

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#06b6d4',
      light: '#22d3ee',
      dark: '#0891b2',
    },
    success: { main: '#10b981', light: '#34d399', dark: '#059669' },
    error:   { main: '#f43f5e', light: '#fb7185', dark: '#e11d48' },
    warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
    info:    { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb' },
    background: {
      default: '#080c14',
      paper: '#0f172a',
    },
    divider: 'rgba(255,255,255,0.06)',
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
      disabled: '#64748b',
    },
  },
  typography: commonTypography,
  shape: { borderRadius: 16 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#080c14',
          scrollbarWidth: 'thin',
          scrollbarColor: '#1e293b transparent',
          '&::-webkit-scrollbar': { width: 6, height: 6 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: '#1e293b', borderRadius: 3 },
          '&::-webkit-scrollbar-thumb:hover': { background: '#334155' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#0f172a',
          border: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.3), 0 2px 4px -1px rgba(0,0,0,0.2)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 12px 30px -4px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.2), 0 0 16px rgba(99,102,241,0.1)',
            transform: 'translateY(-3px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 700,
          fontSize: '0.875rem',
          padding: '8px 18px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(1px)',
          },
        },
        contained: {
          boxShadow: '0 4px 14px 0 rgba(99,102,241,0.25)',
          '&:hover': {
            boxShadow: '0 6px 20px 0 rgba(99,102,241,0.45)',
          },
        },
        outlined: {
          borderColor: 'rgba(255,255,255,0.12)',
          '&:hover': {
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.06)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(255,255,255,0.02)',
            transition: 'all 0.2s ease',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255,255,255,0.06)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(99,102,241,0.5)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(255,255,255,0.03)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#6366f1',
                borderWidth: 1.5,
              },
              boxShadow: '0 0 0 3px rgba(99,102,241,0.15)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          borderRadius: 8,
          transition: 'all 0.15s ease',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.05)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: 'rgba(255,255,255,0.02)',
            fontWeight: 800,
            fontSize: '0.72rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#64748b',
            borderBottom: '1.5px solid rgba(255,255,255,0.06)',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.18s ease',
          '&:hover': {
            backgroundColor: 'rgba(99,102,241,0.03)',
          },
          '&:last-child .MuiTableCell-root': {
            borderBottom: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundImage: 'none', backgroundColor: '#0c1322' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: '#0f172a',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 20,
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1e293b',
          border: '1px solid rgba(255,255,255,0.08)',
          fontSize: '0.75rem',
          borderRadius: 8,
          padding: '6px 10px',
        },
      },
    },
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#06b6d4',
      light: '#22d3ee',
      dark: '#0891b2',
    },
    success: { main: '#10b981', light: '#34d399', dark: '#059669' },
    error:   { main: '#f43f5e', light: '#fb7185', dark: '#e11d48' },
    warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
    info:    { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb' },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    divider: 'rgba(0,0,0,0.06)',
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
      disabled: '#94a3b8',
    },
  },
  typography: commonTypography,
  shape: { borderRadius: 16 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f8fafc',
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 transparent',
          '&::-webkit-scrollbar': { width: 6, height: 6 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: '#cbd5e1', borderRadius: 3 },
          '&::-webkit-scrollbar-thumb:hover': { background: '#94a3b8' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#ffffff',
          border: '1px solid rgba(0,0,0,0.04)',
          boxShadow: '0 4px 12px -2px rgba(0,0,0,0.03), 0 2px 4px -1px rgba(0,0,0,0.02)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 12px 28px -4px rgba(0,0,0,0.08), 0 0 0 1px rgba(99,102,241,0.15), 0 0 16px rgba(99,102,241,0.04)',
            transform: 'translateY(-3px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 700,
          fontSize: '0.875rem',
          padding: '8px 18px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(1px)',
          },
        },
        contained: {
          boxShadow: '0 4px 14px 0 rgba(99,102,241,0.2)',
          '&:hover': {
            boxShadow: '0 6px 18px 0 rgba(99,102,241,0.35)',
          },
        },
        outlined: {
          borderColor: 'rgba(0,0,0,0.12)',
          '&:hover': {
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.04)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(0,0,0,0.01)',
            transition: 'all 0.2s ease',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(0,0,0,0.08)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(99,102,241,0.4)',
            },
            '&.Mui-focused': {
              backgroundColor: '#ffffff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#6366f1',
                borderWidth: 1.5,
              },
              boxShadow: '0 0 0 3px rgba(99,102,241,0.1)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          borderRadius: 8,
          transition: 'all 0.15s ease',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(0,0,0,0.05)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '14px 16px',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#f8fafc',
            fontWeight: 800,
            fontSize: '0.72rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#64748b',
            borderBottom: '1.5px solid rgba(0,0,0,0.06)',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.18s ease',
          '&:hover': {
            backgroundColor: 'rgba(99,102,241,0.02)',
          },
          '&:last-child .MuiTableCell-root': {
            borderBottom: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          border: '1px solid rgba(0,0,0,0.05)',
          borderRadius: 20,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});
