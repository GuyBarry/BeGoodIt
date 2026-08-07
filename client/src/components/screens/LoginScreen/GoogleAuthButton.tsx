import { Box, CircularProgress, Typography } from '@mui/material';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { GRADIENTS, PALETTE } from '../../../styles/tokens';
import type { Mode } from './types';

interface Props {
  mode: Mode;
  isPending: boolean;
  onSuccess: (response: CredentialResponse) => void;
  onError: () => void;
}

export default function GoogleAuthButton({ mode, isPending, onSuccess, onError }: Props) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
      {isPending ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <CircularProgress size={20} sx={{ color: PALETTE.primary }} />
          <Typography variant="body2" color="text.secondary">
            Signing you in…
          </Typography>
        </Box>
      ) : (
        <Box sx={{ p: 0.5, borderRadius: 2, background: GRADIENTS.primarySubtle }}>
          <GoogleLogin
            onSuccess={onSuccess}
            onError={onError}
            shape="pill"
            theme="outline"
            size="large"
            text={mode === 'signin' ? 'signin_with' : 'signup_with'}
          />
        </Box>
      )}
    </Box>
  );
}
