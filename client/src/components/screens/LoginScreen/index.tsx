import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { authApi } from '../../../api/api/auth.api';
import type { User } from '../../../entities';
import { useAuth } from '../../../auth/AuthContext';
import { GRADIENTS, PALETTE, PRIMARY_ALPHA, SERIF_FONT } from '../../../styles/tokens';

type Mode = 'signin' | 'signup';

const extractErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; error?: string } | undefined;
    return data?.message ?? data?.error ?? fallback;
  }
  return fallback;
};

export default function LoginScreen() {
  const { setUser } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // form state
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSuccess = (user: User) => {
    setErrorMessage(null);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'signin') {
      if (!identifier.trim() || !password) {
        setErrorMessage('Please enter your email or username and password.');
        return;
      }
      signIn({ identifier: identifier.trim(), password });
    } else {
      if (!username.trim() || !email.trim() || !password) {
        setErrorMessage('Please fill in username, email, and password.');
        return;
      }
      if (password.length < 8) {
        setErrorMessage('Password must be at least 8 characters long.');
        return;
      }
      signUp({ username: username.trim(), email: email.trim(), password });
    }
  };

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    setErrorMessage(null);
    setPassword('');
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

        {/* Pill tab switcher */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mb: 3,
            p: 0.5,
            bgcolor: 'action.hover',
            borderRadius: 3,
          }}
        >
          {(['signin', 'signup'] as const).map((m) => (
            <Box
              key={m}
              component="button"
              type="button"
              onClick={() => switchMode(m)}
              sx={{
                flex: 1,
                py: 1,
                border: 'none',
                cursor: 'pointer',
                borderRadius: 2.5,
                fontWeight: 600,
                fontSize: 13,
                fontFamily: 'inherit',
                transition: 'all 0.2s',
                ...(mode === m
                  ? {
                      bgcolor: 'background.paper',
                      color: 'text.primary',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                    }
                  : { bgcolor: 'transparent', color: 'text.secondary' }),
              }}
            >
              {m === 'signin' ? 'Sign in' : 'Sign up'}
            </Box>
          ))}
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2.5, textAlign: 'left' }}
        >
          {mode === 'signin' ? (
            <TextField
              label="Email or username"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              fullWidth
              size="small"
              required
            />
          ) : (
            <>
              <TextField
                label="Username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
                size="small"
                required
                helperText="3-32 letters, numbers, dot, dash, or underscore"
              />
              <TextField
                label="Email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                size="small"
                required
              />
            </>
          )}

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            size="small"
            required
            helperText={mode === 'signup' ? 'At least 8 characters' : undefined}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((v) => !v)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isBusy}
            sx={{
              mt: 0.5,
              py: 1.4,
              borderRadius: 3,
              textTransform: 'none',
              fontSize: 15,
              fontWeight: 600,
              background: GRADIENTS.primary,
              boxShadow: `0 8px 24px -12px ${PRIMARY_ALPHA[55]}`,
              '&:hover': {
                filter: 'brightness(1.05)',
                boxShadow: `0 10px 28px -10px ${PRIMARY_ALPHA[55]}`,
              },
            }}
          >
            {isSignInPending || isSignUpPending ? (
              <CircularProgress size={20} sx={{ color: '#fff' }} />
            ) : mode === 'signin' ? (
              'Sign in'
            ) : (
              'Create account'
            )}
          </Button>
        </Box>

        <Divider sx={{ my: 2.5, '&::before, &::after': { borderColor: 'divider' } }}>
          <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
            OR
          </Typography>
        </Divider>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
          {isGooglePending ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
              <CircularProgress size={20} sx={{ color: PALETTE.primary }} />
              <Typography variant="body2" color="text.secondary">
                Signing you in…
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 0.5, borderRadius: 2, background: GRADIENTS.primarySubtle }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() =>
                  setErrorMessage('Google sign-in was interrupted. Please try again.')
                }
                shape="pill"
                theme="outline"
                size="large"
                text={mode === 'signin' ? 'signin_with' : 'signup_with'}
              />
            </Box>
          )}
        </Box>

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
          By continuing you agree to our terms of service and confirm you've
          read our privacy policy.
        </Typography>
      </Paper>
    </Box>
  );
}
