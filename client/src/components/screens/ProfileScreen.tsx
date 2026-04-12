import { Box, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

export default function ProfileScreen() {
  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <PersonIcon sx={{ color: 'primary.main', fontSize: 32 }} />
        <Typography variant="h4" sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600 }}>
          Profile
        </Typography>
      </Box>
      <Typography color="text.secondary">Your stats & settings — coming soon.</Typography>
    </Box>
  );
}
