import { Box, Typography } from '@mui/material';
import { GRADIENTS, SERIF_FONT } from '../../../styles/tokens';
import { getInitials } from '../../../lib/initials';
import type { User } from '../../../entities/user';

interface Props {
  user: User;
}

export default function ProfileCard({ user }: Props) {
  return (
    <Box
      sx={{
        position: 'relative',
        background: GRADIENTS.primarySubtle,
        borderRadius: 4,
        p: 4,
        overflow: 'hidden',
        textAlign: 'center',
        height: 220,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: GRADIENTS.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
        }}
      >
        <Typography sx={{ color: '#fff', fontSize: 28, fontFamily: SERIF_FONT, fontWeight: 600 }}>
          {getInitials(user.username)}
        </Typography>
      </Box>
      <Typography variant="h5">
        {user.username}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        Member since {new Date(user.createdAt).getFullYear()}
      </Typography>
    </Box>
  );
}
