import { Box, Button, Paper, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { GRADIENTS } from '../../../styles/tokens';

export default function AvatarCard() {
  return (
    <Paper elevation={0} sx={{ borderRadius: 3, p: 3, border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', gap: 2.5 }}>
        <Box sx={{
          width: 64, height: 64, borderRadius: 3, flexShrink: 0,
          background: GRADIENTS.primarySubtle,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AutoAwesomeIcon sx={{ color: 'primary.main', fontSize: 28 }} />
        </Box>
        <Box>
          <Typography variant="h6">Create Your Avatar</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Upload 3–5 full-body photos to enable virtual try-on. AI will create a digital version of you for realistic outfit previews.
          </Typography>
          <Button disabled size="small" sx={{ mt: 1.5, borderRadius: 2, textTransform: 'none' }}>
            Coming Soon
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
