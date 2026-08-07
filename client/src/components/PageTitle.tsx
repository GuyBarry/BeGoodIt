import { Typography, type TypographyProps } from '@mui/material';
import { SERIF_FONT } from '../styles/tokens';

export default function PageTitle({ sx, ...props }: TypographyProps) {
  return (
    <Typography
      variant="h4"
      sx={{ fontFamily: SERIF_FONT, fontWeight: 600, ...sx }}
      {...props}
    />
  );
}
