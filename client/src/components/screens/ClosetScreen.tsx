import { Box, Typography } from '@mui/material';
import CheckroomIcon from '@mui/icons-material/Checkroom';

export default function ClosetScreen() {
  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <CheckroomIcon sx={{ color: 'primary.main', fontSize: 32 }} />
        <Typography variant="h4">
          My Closet
        </Typography>
      </Box>
      <Typography color="text.secondary">Browse your wardrobe — coming soon.</Typography>
    </Box>
  );
}
