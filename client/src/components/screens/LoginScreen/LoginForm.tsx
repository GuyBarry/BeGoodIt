import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { GRADIENTS, PRIMARY_ALPHA } from '../../../styles/tokens';
import type { Mode } from './types';

interface Props {
  mode: Mode;
  isBusy: boolean;
  isSubmitting: boolean;
  onSignIn: (payload: { identifier: string; password: string }) => void;
  onSignUp: (payload: { username: string; email: string; password: string }) => void;
  onValidationError: (message: string) => void;
  onClearError: () => void;
}

export default function LoginForm({
  mode,
  isBusy,
  isSubmitting,
  onSignIn,
  onSignUp,
  onValidationError,
  onClearError,
}: Props) {
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Clear the password whenever the user switches between sign in and sign up.
  useEffect(() => {
    setPassword('');
  }, [mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClearError();

    if (mode === 'signin') {
      if (!identifier.trim() || !password) {
        onValidationError('Please enter your email or username and password.');
        return;
      }
      onSignIn({ identifier: identifier.trim(), password });
      return;
    }

    if (!username.trim() || !email.trim() || !password) {
      onValidationError('Please fill in username, email, and password.');
      return;
    }
    if (password.length < 8) {
      onValidationError('Password must be at least 8 characters long.');
      return;
    }
    onSignUp({ username: username.trim(), email: email.trim(), password });
  };

  return (
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
                  {showPassword ? (
                    <VisibilityOffIcon fontSize="small" />
                  ) : (
                    <VisibilityIcon fontSize="small" />
                  )}
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
        {isSubmitting ? (
          <CircularProgress size={20} sx={{ color: '#fff' }} />
        ) : mode === 'signin' ? (
          'Sign in'
        ) : (
          'Create account'
        )}
      </Button>
    </Box>
  );
}
