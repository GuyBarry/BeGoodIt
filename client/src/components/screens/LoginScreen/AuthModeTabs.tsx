import { Box } from '@mui/material';
import type { Mode } from './types';

interface Props {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

export default function AuthModeTabs({ mode, onChange }: Props) {
  return (
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
          onClick={() => onChange(m)}
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
  );
}
