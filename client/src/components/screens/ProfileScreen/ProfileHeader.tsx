import { Box, Typography } from '@mui/material';

export default function ProfileHeader() {
  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        px: 4,
        py: 2.5,
      }}
    >
      <Box sx={{ maxWidth: 900, mx: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">
          Profile
        </Typography>
      </Box>
    </Box>
  );
}
