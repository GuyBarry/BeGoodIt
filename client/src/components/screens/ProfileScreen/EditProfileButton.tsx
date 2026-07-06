import { Box, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { PRIMARY_ALPHA } from '../../../styles/tokens';

interface Props {
  onClick: () => void;
}

export default function EditProfileButton({ onClick }: Props) {
  return (
    <Box
      component="button"
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2.5,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        cursor: 'pointer',
        transition: 'background-color 0.15s, border-color 0.15s',
        '&:hover': {
          bgcolor: PRIMARY_ALPHA[4],
          borderColor: 'primary.light',
        },
      }}
    >
      <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <PersonIcon sx={{ color: 'text.secondary' }} />
      </Box>
      <Box sx={{ flex: 1, textAlign: 'left' }}>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>Edit Profile</Typography>
        <Typography variant="caption" color="text.secondary">Update your details and preferences</Typography>
      </Box>
      <ChevronRightIcon sx={{ color: 'text.secondary' }} />
    </Box>
  );
}
