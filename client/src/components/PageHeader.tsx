import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import PageTitle from './PageTitle';

interface Props {
  title: ReactNode;
  subtitle?: ReactNode;
  maxWidth?: number;
  left?: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
}

export default function PageHeader({ title, subtitle, maxWidth = 1280, left, right, children }: Props) {
  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        bgcolor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        px: 4,
        py: 3,
      }}
    >
      <Box sx={{ maxWidth, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {left}
            <Box>
              <PageTitle>{title}</PageTitle>
              {subtitle && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          {right}
        </Box>
        {children}
      </Box>
    </Box>
  );
}
