import { alpha, createTheme } from '@mui/material/styles';
import { PALETTE, SERIF_FONT } from './styles/tokens';

const theme = createTheme({
  palette: {
    primary: {
      main: PALETTE.primary,
      light: PALETTE.primaryLight,
      dark: PALETTE.primaryDark,
      contrastText: '#ffffff',
    },
    background: {
      default: '#faf9f7',
      paper: '#ffffff',
    },
    divider: 'rgba(0,0,0,0.08)',
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    h4: { fontFamily: SERIF_FONT, fontWeight: 600 },
    h5: { fontFamily: SERIF_FONT, fontWeight: 600 },
    h6: { fontFamily: SERIF_FONT, fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: `${alpha(PALETTE.primary, 0.25)} transparent`,
        },
        '*::-webkit-scrollbar': {
          width: 8,
          height: 8,
        },
        '*::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: alpha(PALETTE.primary, 0.2),
          borderRadius: 999,
          backgroundClip: 'padding-box',
          border: '2px solid transparent',
        },
        '*::-webkit-scrollbar-thumb:hover': {
          backgroundColor: alpha(PALETTE.primary, 0.4),
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
