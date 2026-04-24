import { alpha } from '@mui/material/styles';

export const PALETTE = {
  primary: '#c86432',
  primaryLight: '#e8956d',
  primaryDark: '#a04e22',
} as const;

export const SERIF_FONT = '"Cormorant Garamond", Georgia, serif';

export const GRADIENTS = {
  primary: `linear-gradient(135deg, ${PALETTE.primary} 0%, ${PALETTE.primaryLight} 100%)`,
  primarySubtle: `linear-gradient(135deg, ${alpha(PALETTE.primary, 0.12)} 0%, ${alpha(PALETTE.primaryLight, 0.06)} 100%)`,
  primaryMedium: `linear-gradient(135deg, ${alpha(PALETTE.primary, 0.25)} 0%, ${alpha(PALETTE.primaryLight, 0.25)} 100%)`,
} as const;

export const PRIMARY_ALPHA = {
  4:  alpha(PALETTE.primary, 0.04),
  10: alpha(PALETTE.primary, 0.1),
  12: alpha(PALETTE.primary, 0.12),
  15: alpha(PALETTE.primary, 0.15),
  20: alpha(PALETTE.primary, 0.2),
  25: alpha(PALETTE.primary, 0.25),
  35: alpha(PALETTE.primary, 0.35),
  45: alpha(PALETTE.primary, 0.45),
  55: alpha(PALETTE.primary, 0.55),
} as const;
