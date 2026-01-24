import { createTheme } from '@mui/material/styles';

// Craton Design Tokens
export const COLORS = {
  // Primary
  navy: '#0A2342',
  navyLight: '#153258',
  navyDark: '#051529',

  // Secondary
  gold: '#C5A065',
  goldLight: '#D4B87A',
  goldDark: '#b08d55',

  // Success
  green: '#0F6D43',
  greenDark: '#15803d',
  greenLight: '#0b5031',
  greenBg: '#F0FDF4',

  // Error
  red: '#B91C1C',
  redBg: '#FEF2F2',

  // Warning
  amber: '#B45309',
  amberDark: '#92400e',
  amberBg: '#FFFBEB',

  // Info / Blue
  blue: '#3b82f6',
  blueDark: '#1d4ed8',
  blueBg: '#eff6ff',

  // Neutrals
  slate: '#3E5C76',
  slateLight: '#64748b',
  gray300: '#cbd5e1',
  gray400: '#94a3b8',
  gray500: '#64748b',
  background: '#F5F7FA',
  border: '#E5E7EB',
  white: '#FFFFFF',

  // Text
  textPrimary: '#0A2342',
  textSecondary: '#3E5C76',
  textMuted: '#64748b',
  textDark: '#1e293b',
  black: '#1A1A1A',
};

const theme = createTheme({
  palette: {
    primary: {
      main: COLORS.navy,
      light: COLORS.navyLight,
      dark: COLORS.navyDark,
      contrastText: COLORS.white,
    },
    secondary: {
      main: COLORS.gold,
      light: COLORS.goldLight,
      dark: COLORS.goldDark,
      contrastText: COLORS.navy,
    },
    success: {
      main: COLORS.green,
      light: COLORS.greenBg,
      contrastText: COLORS.white,
    },
    error: {
      main: COLORS.red,
      light: COLORS.redBg,
      contrastText: COLORS.white,
    },
    warning: {
      main: COLORS.amber,
      light: COLORS.amberBg,
    },
    background: {
      default: COLORS.background,
      paper: COLORS.white,
    },
    text: {
      primary: COLORS.textPrimary,
      secondary: COLORS.textSecondary,
    },
    divider: COLORS.border,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Playfair Display", "Georgia", serif',
      fontWeight: 700,
      color: COLORS.navy,
    },
    h2: {
      fontFamily: '"Playfair Display", "Georgia", serif',
      fontWeight: 700,
      color: COLORS.navy,
    },
    h3: {
      fontFamily: '"Playfair Display", "Georgia", serif',
      fontWeight: 600,
      color: COLORS.navy,
    },
    h4: {
      fontFamily: '"Playfair Display", "Georgia", serif',
      fontWeight: 600,
      color: COLORS.navy,
    },
    h5: {
      fontWeight: 600,
      color: COLORS.navy,
    },
    h6: {
      fontWeight: 600,
      color: COLORS.navy,
    },
    subtitle1: {
      fontSize: '0.875rem',
      color: COLORS.slate,
    },
    subtitle2: {
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: COLORS.slate,
    },
    body1: {
      fontSize: '0.875rem',
    },
    body2: {
      fontSize: '0.75rem',
    },
    caption: {
      fontSize: '0.625rem',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      fontWeight: 700,
      color: COLORS.slate,
    },
    button: {
      textTransform: 'uppercase',
      fontWeight: 700,
      letterSpacing: '0.05em',
    },
  },
  shape: {
    borderRadius: 2,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
        },
        containedPrimary: {
          backgroundColor: COLORS.navy,
          '&:hover': {
            backgroundColor: COLORS.navyLight,
          },
        },
        containedSecondary: {
          backgroundColor: COLORS.gold,
          color: COLORS.navy,
          '&:hover': {
            backgroundColor: COLORS.goldDark,
          },
        },
        outlined: {
          borderColor: COLORS.border,
          color: COLORS.navy,
          '&:hover': {
            borderColor: COLORS.navy,
            backgroundColor: COLORS.background,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        },
        outlined: {
          border: `1px solid ${COLORS.border}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          border: `1px solid ${COLORS.border}`,
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '& fieldset': {
              borderColor: COLORS.border,
            },
            '&:hover fieldset': {
              borderColor: COLORS.slate,
            },
            '&.Mui-focused fieldset': {
              borderColor: COLORS.gold,
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          '& fieldset': {
            borderColor: COLORS.border,
          },
          '&:hover fieldset': {
            borderColor: COLORS.slate,
          },
          '&.Mui-focused fieldset': {
            borderColor: COLORS.gold,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          fontWeight: 700,
          fontSize: '0.625rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'uppercase',
          fontWeight: 700,
          fontSize: '0.75rem',
          letterSpacing: '0.05em',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: COLORS.background,
          '& .MuiTableCell-head': {
            color: COLORS.slate,
            fontWeight: 700,
            fontSize: '0.625rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${COLORS.border}`,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 2,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: COLORS.navy,
          color: COLORS.white,
        },
      },
    },
  },
});

export default theme;
