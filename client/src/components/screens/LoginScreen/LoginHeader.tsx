import { Box, Typography } from '@mui/material';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import { GRADIENTS, PRIMARY_ALPHA, SERIF_FONT } from '../../../styles/tokens';
import type { Mode } from './types';

interface Props {
  mode: Mode;
}

export default function LoginHeader({ mode }: Props) {
  return (
    <>
      <Box
        sx={{
          width: 60,
          height: 60,
          borderRadius: 3,
          mx: 'auto',
          mb: 2.5,
          background: GRADIENTS.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 12px 28px -12px ${PRIMARY_ALPHA[55]}`,
        }}
      >
        <CheckroomIcon sx={{ color: '#fff', fontSize: 30 }} />
      </Box>

      <Typography variant="h4" sx={{ fontFamily: SERIF_FONT, fontWeight: 600, mb: 0.5 }}>
        {mode === 'signin' ? 'Welcome back' : 'Create your account'}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ lineHeight: 1.6, mb: 3.5, maxWidth: 340, mx: 'auto' }}
      >
        {mode === 'signin'
          ? 'Sign in to your BeGoodIt closet, fitting room and stylist.'
          : 'Start curating outfits that look great on you.'}
      </Typography>
    </>
  );
}
