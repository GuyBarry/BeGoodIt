import { useEffect, useMemo, type ReactNode } from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider, lighten, darken } from '@mui/material/styles';
import { useUser } from './api';
import { createAppTheme } from './theme';
import {
  DEFAULT_PRIMARY,
  DEFAULT_PRIMARY_LIGHT,
  DEFAULT_PRIMARY_DARK,
} from './styles/tokens';
import { parseColorChoice } from './components/screens/ProfileScreen/avatarColor';

// Same demo user the rest of the app reads from. When real auth lands this
// becomes useCurrentUser().id and the provider re-themes per-user.
const CURRENT_USER_ID = '00000000-0000-0000-0000-000000000001';

const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
};

const DEFAULT_RGB = hexToRgb(DEFAULT_PRIMARY);

export function ThemePaletteProvider({ children }: { children: ReactNode }) {
  const { data: user } = useUser(CURRENT_USER_ID);
  const chosen = parseColorChoice(user?.profilePictureUrl);
  const primary = chosen ?? DEFAULT_PRIMARY;

  const theme = useMemo(() => createAppTheme(primary), [primary]);

  useEffect(() => {
    const style = document.documentElement.style;

    if (chosen) {
      const { r, g, b } = hexToRgb(chosen);
      style.setProperty('--bg-primary', chosen);
      style.setProperty('--bg-primary-light', lighten(chosen, 0.3));
      style.setProperty('--bg-primary-dark', darken(chosen, 0.2));
      style.setProperty('--bg-primary-r', String(r));
      style.setProperty('--bg-primary-g', String(g));
      style.setProperty('--bg-primary-b', String(b));
    } else {
      style.setProperty('--bg-primary', DEFAULT_PRIMARY);
      style.setProperty('--bg-primary-light', DEFAULT_PRIMARY_LIGHT);
      style.setProperty('--bg-primary-dark', DEFAULT_PRIMARY_DARK);
      style.setProperty('--bg-primary-r', String(DEFAULT_RGB.r));
      style.setProperty('--bg-primary-g', String(DEFAULT_RGB.g));
      style.setProperty('--bg-primary-b', String(DEFAULT_RGB.b));
    }
  }, [chosen]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
