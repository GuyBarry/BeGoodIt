import { Box, Typography } from '@mui/material';

interface Props {
  onGetInspired?: () => void;
}

export default function FittingRoomHeader({ onGetInspired: _ }: Props) {
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
      <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
        <Typography variant="h4">Fitting Room</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          Create your perfect look
        </Typography>
      </Box>
    </Box>
  );
}
