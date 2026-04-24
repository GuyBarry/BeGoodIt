import { createTheme } from '@mui/material/styles';
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
