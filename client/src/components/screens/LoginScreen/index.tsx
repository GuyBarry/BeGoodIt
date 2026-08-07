import { useState } from 'react';
import { Alert, Box, Divider, Paper, Typography } from '@mui/material';
import { type CredentialResponse } from '@react-oauth/google';
import { useMutation } from '@tanstack/react-query';
import { authApi, type AuthResponse } from '../../../api/api/auth.api';
import { useAuth } from '../../../auth/AuthContext';
import { setTokens } from '../../../auth/tokenStorage';
import { PRIMARY_ALPHA } from '../../../styles/tokens';
import type { Mode } from './types';
import { extractErrorMessage } from './utils';
import LoginHeader from './LoginHeader';
import AuthModeTabs from './AuthModeTabs';
import LoginForm from './LoginForm';
import GoogleAuthButton from './GoogleAuthButton';

export default function LoginScreen() {
  const { setUser } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSuccess = ({ user, token, refreshToken }: AuthResponse) => {
    setErrorMessage(null);
    setTokens({ token, refreshToken });
    setUser(user);
  };

  const { mutate: signInWithGoogle, isPending: isGooglePending } = useMutation({
    mutationFn: (credential: string) => authApi.loginWithGoogle(credential),
    onSuccess: handleSuccess,
    onError: (err) => setErrorMessage(extractErrorMessage(err, "We couldn't sign you in.")),
  });

  const { mutate: signIn, isPending: isSignInPending } = useMutation({
    mutationFn: authApi.login,
    onSuccess: handleSuccess,
    onError: (err) =>
      setErrorMessage(extractErrorMessage(err, 'Invalid email/username or password.')),
  });

  const { mutate: signUp, isPending: isSignUpPending } = useMutation({
    mutationFn: authApi.register,
    onSuccess: handleSuccess,
    onError: (err) =>
      setErrorMessage(extractErrorMessage(err, "We couldn't create your account.")),
  });

  const isBusy = isGooglePending || isSignInPending || isSignUpPending;

  const handleGoogleSuccess = (response: CredentialResponse) => {
    if (!response.credential) {
      setErrorMessage('Google did not return a credential. Please try again.');
      return;
    }
    signInWithGoogle(response.credential);
  };

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    setErrorMessage(null);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
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
          maxWidth: 460,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          px: { xs: 3.5, sm: 5 },
          py: { xs: 4.5, sm: 5.5 },
          textAlign: 'center',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255,255,255,0.88)',
          boxShadow: `0 24px 60px -24px ${PRIMARY_ALPHA[20]}`,
        }}
      >
        <LoginHeader mode={mode} />

        <AuthModeTabs mode={mode} onChange={switchMode} />

        <LoginForm
          mode={mode}
          isBusy={isBusy}
          isSubmitting={isSignInPending || isSignUpPending}
          onSignIn={signIn}
          onSignUp={signUp}
          onValidationError={setErrorMessage}
          onClearError={() => setErrorMessage(null)}
        />

        <Divider sx={{ my: 2.5, '&::before, &::after': { borderColor: 'divider' } }}>
          <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
            OR
          </Typography>
        </Divider>

        <GoogleAuthButton
          mode={mode}
          isPending={isGooglePending}
          onSuccess={handleGoogleSuccess}
          onError={() => setErrorMessage('Google sign-in was interrupted. Please try again.')}
        />

        {errorMessage && (
          <Alert severity="error" sx={{ borderRadius: 2, textAlign: 'left', mt: 1.5 }}>
            {errorMessage}
          </Alert>
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 3.5, lineHeight: 1.6 }}
        >
          By continuing you agree to our terms of service and confirm you've read our privacy
          policy.
        </Typography>
      </Paper>
    </Box>
  );
}
