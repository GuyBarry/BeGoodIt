import { createTheme, lighten, darken } from '@mui/material/styles';
import {
  DEFAULT_PRIMARY,
  DEFAULT_PRIMARY_LIGHT,
  DEFAULT_PRIMARY_DARK,
  SERIF_FONT,
} from './styles/tokens';

// Build a MUI theme rooted on `primary`. When a custom hex is supplied we
// derive light/dark from it; for the original orange we keep the hand-tuned
// shades that ship in tokens.ts.
export function createAppTheme(primary: string = DEFAULT_PRIMARY) {
  const isCustom = primary.toLowerCase() !== DEFAULT_PRIMARY.toLowerCase();
  const primaryLight = isCustom ? lighten(primary, 0.3) : DEFAULT_PRIMARY_LIGHT;
  const primaryDark = isCustom ? darken(primary, 0.2) : DEFAULT_PRIMARY_DARK;

  return createTheme({
    palette: {
      primary: {
        main: primary,
        light: primaryLight,
        dark: primaryDark,
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
}

const theme = createAppTheme();
export default theme;
