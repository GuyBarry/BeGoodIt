import { useState } from 'react';
import { Box, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../../api/api/auth.api';
import { useAuth } from '../../../auth/AuthContext';
import { GRADIENTS, PALETTE, PRIMARY_ALPHA, SERIF_FONT } from '../../../styles/tokens';

export default function LoginScreen() {
  const { setUser } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { mutate: loginWithGoogle, isPending } = useMutation({
    mutationFn: (credential: string) => authApi.loginWithGoogle(credential),
    onSuccess: (user) => {
      setErrorMessage(null);
      setUser(user);
    },
    onError: () => {
      setErrorMessage("We couldn't sign you in. Please try again.");
    },
  });

  const handleSuccess = (response: CredentialResponse) => {
    if (!response.credential) {
      setErrorMessage('Google did not return a credential. Please try again.');
      return;
    }
    loginWithGoogle(response.credential);
  };

  const handleError = () => {
    setErrorMessage('Google sign-in was interrupted. Please try again.');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 6,
        background: `radial-gradient(circle at 20% 0%, ${PRIMARY_ALPHA[15]}, transparent 55%),
                     radial-gradient(circle at 80% 100%, ${PRIMARY_ALPHA[10]}, transparent 60%),
                     #faf9f7`,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          px: { xs: 3.5, sm: 5 },
          py: { xs: 5, sm: 6 },
          textAlign: 'center',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255,255,255,0.85)',
          boxShadow: `0 24px 60px -24px ${PRIMARY_ALPHA[20]}`,
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: 3,
            mx: 'auto',
            mb: 3,
            background: GRADIENTS.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 12px 28px -12px ${PRIMARY_ALPHA[55]}`,
          }}
        >
          <CheckroomIcon sx={{ color: '#fff', fontSize: 32 }} />
        </Box>

        <Typography
          variant="h4"
          sx={{ fontFamily: SERIF_FONT, fontWeight: 600, mb: 1 }}
        >
          Welcome to BeGoodIt
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.7, mb: 4, maxWidth: 320, mx: 'auto' }}
        >
          Your smart wardrobe, fitting room and stylist — sign in to start
          curating outfits that look great on you.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {isPending ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
              <CircularProgress size={20} sx={{ color: PALETTE.primary }} />
              <Typography variant="body2" color="text.secondary">
                Signing you in…
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                p: 0.5,
                borderRadius: 2,
                background: GRADIENTS.primarySubtle,
              }}
            >
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                shape="pill"
                theme="outline"
                size="large"
                text="continue_with"
              />
            </Box>
          )}

          {errorMessage && (
            <Alert severity="error" sx={{ width: '100%', borderRadius: 2 }}>
              {errorMessage}
            </Alert>
          )}
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 4, lineHeight: 1.6 }}
        >
          By continuing you agree to our terms of service and confirm you've
          read our privacy policy.
        </Typography>
      </Paper>
    </Box>
  );
}
