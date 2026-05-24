// src/styles/theme.js
import { createTheme, alpha } from '@mui/material/styles';

const COLORS = {
  light: '#B8E3E9',
  soft: '#93B1B5',
  mid: '#aedfe5',
  dark: '#0B2E33',
}

const theme = createTheme({
  palette: {
    mode: 'dark',

    primary: {
      main: COLORS.mid,
      light: COLORS.light,
      dark: COLORS.dark,
      contrastText: '#ffffff',
    },

    secondary: {
      main: COLORS.soft,
      light: COLORS.light,
      dark: COLORS.mid,
      contrastText: '#000000',
    },

    background: {
      default: COLORS.dark,              // full page bg
      paper: alpha(COLORS.mid, 0.15),   // glass card bg
    },

    text: {
      primary: '#ffffff',
      secondary: alpha('#ffffff', 0.7),
    },
  },

  typography: {
    fontFamily: '"Sora", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, letterSpacing: '0.05em' },
  },

  shape: { borderRadius: 12 },

  components: {

    // 🔘 BUTTONS
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },

        containedPrimary: ({ theme }) => ({
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          '&:hover': {
            background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
          },
        }),

        containedSecondary: ({ theme }) => ({
          background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
          color: theme.palette.secondary.contrastText,
        }),
      },
    },

    // 🧊 GLASS CARDS
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          background: alpha(theme.palette.primary.main, 0.12),
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',

          border: `1px solid ${alpha(theme.palette.primary.light, 0.3)}`,
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.dark, 0.4)}`,

          borderRadius: 16,
        }),
      },
    },

    // ✏️ INPUTS
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            color: theme.palette.text.primary,

            '&:hover fieldset': {
              borderColor: theme.palette.primary.main,
            },
            '&.Mui-focused fieldset': {
              borderColor: theme.palette.primary.light,
            },
          },

          '& label': {
            color: theme.palette.text.secondary,
          },

          '& label.Mui-focused': {
            color: theme.palette.primary.light,
          },
        }),
      },
    },

    // ➖ DIVIDER
    MuiDivider: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: alpha(theme.palette.primary.light, 0.2),
        }),
      },
    },

    // 🔝 APPBAR (glass)
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          background: alpha(theme.palette.primary.dark, 0.6),
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${alpha(theme.palette.primary.light, 0.3)}`,
        }),
      },
    },

    // 📂 DRAWER (sidebar)
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          background: alpha(theme.palette.primary.dark, 0.50),
          backdropFilter: 'blur(18px)',
          borderRight: `1px solid ${alpha(theme.palette.primary.light, 0.3)}`,
        }),
      },
    },
  },
})

export default theme