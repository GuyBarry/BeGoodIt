// Default theme color — also used as fallback for the CSS custom properties
// that ThemePaletteProvider sets at :root. Anything that needs a real hex
// (the MUI palette, hexToRgb, etc.) should import these constants directly.
export const DEFAULT_PRIMARY = '#c86432';
export const DEFAULT_PRIMARY_LIGHT = '#e8956d';
export const DEFAULT_PRIMARY_DARK = '#a04e22';

// CSS variables driven by ThemePaletteProvider. The fallback after the comma
// is applied if the variable hasn't been set yet (e.g. before user data loads).
const primaryVar = `var(--bg-primary, ${DEFAULT_PRIMARY})`;
const primaryLightVar = `var(--bg-primary-light, ${DEFAULT_PRIMARY_LIGHT})`;
const primaryDarkVar = `var(--bg-primary-dark, ${DEFAULT_PRIMARY_DARK})`;

// Alpha helpers use the rgb channels so opacity works without hex parsing in CSS.
// The defaults below are the channels of DEFAULT_PRIMARY (#c86432).
const rgbaPrimary = (alpha: number): string =>
  `rgba(var(--bg-primary-r, 200), var(--bg-primary-g, 100), var(--bg-primary-b, 50), ${alpha})`;

export const PALETTE = {
  primary: primaryVar,
  primaryLight: primaryLightVar,
  primaryDark: primaryDarkVar,
} as const;

export const SERIF_FONT = '"Cormorant Garamond", Georgia, serif';

export const GRADIENTS = {
  primary: `linear-gradient(135deg, ${primaryVar} 0%, ${primaryLightVar} 100%)`,
  primarySubtle: `linear-gradient(135deg, ${rgbaPrimary(0.12)} 0%, ${rgbaPrimary(0.06)} 100%)`,
  primaryMedium: `linear-gradient(135deg, ${rgbaPrimary(0.25)} 0%, ${rgbaPrimary(0.25)} 100%)`,
} as const;

export const PRIMARY_ALPHA = {
  4:  rgbaPrimary(0.04),
  10: rgbaPrimary(0.10),
  12: rgbaPrimary(0.12),
  15: rgbaPrimary(0.15),
  20: rgbaPrimary(0.20),
  25: rgbaPrimary(0.25),
  35: rgbaPrimary(0.35),
  45: rgbaPrimary(0.45),
  55: rgbaPrimary(0.55),
} as const;
