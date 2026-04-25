import { Box, Typography } from '@mui/material';

export default function AddItemHeader() {
  return (
    <Box
      component="header"
      sx={{
        position: 'sticky', top: 0, zIndex: 40,
        bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid', borderColor: 'divider',
        px: 4, py: 3,
      }}
    >
      <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
        <Typography variant="h4">Add to Closet</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          Upload a garment and let AI tag it automatically
        </Typography>
      </Box>
    </Box>
  );
}
