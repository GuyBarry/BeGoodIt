import { Box, Button, Tooltip, Typography } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import { PRIMARY_ALPHA } from '../../../styles/tokens';

export default function FittingRoomHeader() {
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
      <Box sx={{ maxWidth: 1280, mx: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4">Fitting Room</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            Create your perfect look
          </Typography>
        </Box>
        <Tooltip title="Coming soon" arrow>
          <span>
            <Button
              variant="contained"
              startIcon={<ImageIcon />}
              disabled
              sx={{
                background: PRIMARY_ALPHA[12],
                color: 'primary.main',
                boxShadow: 'none',
                '&.Mui-disabled': { background: PRIMARY_ALPHA[4], color: 'text.disabled' },
              }}
            >
              Get Inspired
            </Button>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
}
