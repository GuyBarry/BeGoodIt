import { Box, Typography } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { PRIMARY_ALPHA } from '../../../styles/tokens';

interface Props {
  onClick: () => void;
}

export default function LogoutButton({ onClick }: Props) {
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
        textAlign: 'left',
        transition: 'background-color 0.15s, border-color 0.15s',
        '&:hover': {
          bgcolor: PRIMARY_ALPHA[4],
          borderColor: 'primary.light',
        },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          bgcolor: PRIMARY_ALPHA[10],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LogoutIcon sx={{ color: 'primary.main' }} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>Log out</Typography>
        <Typography variant="caption" color="text.secondary">Sign out of your BeGoodIt account</Typography>
      </Box>
      <ChevronRightIcon sx={{ color: 'text.secondary' }} />
    </Box>
  );
}
