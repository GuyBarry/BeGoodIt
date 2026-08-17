import type { ReactNode } from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';

interface Props {
  size: number;
  src?: string | null;
  alt: string;
  fit?: 'contain' | 'cover';
  fallback?: ReactNode;
  fallbackBgcolor?: string;
  sx?: SxProps<Theme>;
}

export default function Thumbnail({ size, src, alt, fit = 'contain', fallback, fallbackBgcolor = 'grey.50', sx }: Props) {
  return (
    <Box
      sx={[
        {
          width: size,
          height: size,
          borderRadius: src || !fallback ? 2.5 : '50%',
          overflow: 'hidden',
          bgcolor: src ? 'grey.50' : fallbackBgcolor,
          border: src ? '1px solid' : 'none',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {src ? (
        <Box component="img" src={src} alt={alt} sx={{ width: '100%', height: '100%', objectFit: fit, display: 'block' }} />
      ) : (
        fallback
      )}
    </Box>
  );
}
